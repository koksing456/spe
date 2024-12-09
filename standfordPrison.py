import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Set
from swarm import Swarm, Agent
from datetime import datetime
import time
import logging
import uvicorn
import asyncio
from collections import deque

# Load environment variables from .env file
load_dotenv()

# Define request/response models
class SimulationState(BaseModel):
    day: int = 1
    hour: int = 6
    incident_count: int = 0
    stress_level: int = 0
    messages: List[Dict] = []

class SimulationResponse(BaseModel):
    status: str
    context: Dict
    responses: Optional[Dict] = None
    is_terminated: bool = False
    message: Optional[str] = None

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware with specific origins
origins = [
    "http://localhost:5173",  # Vite's default development server
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Swarm client
client = Swarm()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    encoding='utf-8'
)

# Load instructions from instructions.py
from instructions import (
    guard_system_message, 
    prisoner_system_message,
    narrator_system_message,
    psychologist_system_message,
    observer_system_message
)

def transfer_to_guard():
    """Transfer control to guard agent."""
    return guard_agent

def transfer_to_prisoner():
    """Transfer control to prisoner agent."""
    return prisoner_agent

def transfer_to_psychologist():
    """Transfer control to psychologist for evaluation."""
    return psychologist_agent

def transfer_to_narrator():
    """Transfer control to narrator for reporting."""
    return narrator_agent

def log_incident(severity, description, context_variables):
    """Log an incident and update stress levels."""
    context = context_variables.copy()
    context['incident_count'] = context.get('incident_count', 0) + 1
    context['stress_level'] = min(10, context.get('stress_level', 0) + severity)
    
    return {
        "value": f"Incident logged: {description} (Severity: {severity}/10)",
        "context_variables": context
    }

# Initialize all agents
narrator_agent = Agent(
    name="Narrator",
    instructions=narrator_system_message,
    functions=[transfer_to_guard, transfer_to_prisoner, log_incident]
)

guard_agent = Agent(
    name="Guard",
    instructions=guard_system_message,
    functions=[transfer_to_psychologist, log_incident]
)

prisoner_agent = Agent(
    name="Prisoner",
    instructions=prisoner_system_message,
    functions=[transfer_to_psychologist]
)

psychologist_agent = Agent(
    name="Psychologist",
    instructions=psychologist_system_message,
    functions=[transfer_to_narrator, log_incident]
)

observer_agent = Agent(
    name="Observer",
    instructions=observer_system_message,
    functions=[log_incident]
)

# WebSocket connection manager
class SimulationEvent:
    def __init__(self, name, description):
        self.name = name
        self.description = description

class ConnectionManager:
    def __init__(self):
        self.active_connections = set()
        self.message_history = deque(maxlen=100)
        self.current_state = SimulationState().dict()
        self.last_update = time.time()
        self.min_update_interval = 3
        self.time_progression = {
            "day": 1,
            "hour": 6,  # Start at 6 AM
            "hours_per_update": 4  # Progress 4 hours each update
        }
        self.daily_events = {
            6: SimulationEvent("Wake-up", "Prisoners are woken up for morning roll call"),
            10: SimulationEvent("Morning Activities", "Prisoners engage in assigned tasks"),
            14: SimulationEvent("Lunch", "Meal time and brief social interaction"),
            18: SimulationEvent("Evening Activities", "Restricted movement and final tasks"),
            22: SimulationEvent("Lights Out", "Prisoners return to cells for the night")
        }
        
    def get_current_event(self):
        hour = self.time_progression["hour"]
        return self.daily_events.get(hour, None)

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        # Send current state and message history to new connection
        await websocket.send_json({
            "type": "state_update",
            "state": self.current_state
        })
        if self.message_history:
            await websocket.send_json({
                "type": "new_messages",
                "messages": list(self.message_history)
            })

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    def progress_time(self):
        """Progress time by 4 hours"""
        self.time_progression["hour"] += self.time_progression["hours_per_update"]
        if self.time_progression["hour"] >= 22:  # Last update at 10 PM
            self.time_progression["hour"] = 6  # Reset to 6 AM
            self.time_progression["day"] += 1
        return f"Day {self.time_progression['day']}, {self.time_progression['hour']:02d}:00"

    def get_current_time(self):
        """Get current simulation time"""
        return f"Day {self.time_progression['day']}, {self.time_progression['hour']:02d}:00"

    async def broadcast(self, message: dict):
        if message.get("type") == "new_messages":
            self.message_history.extend(message["messages"])
        elif message.get("type") == "state_update":
            self.current_state.update(message["state"])
        
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except WebSocketDisconnect:
                disconnected.add(connection)
        
        # Remove disconnected clients
        self.active_connections -= disconnected

    def can_update(self):
        current_time = time.time()
        if current_time - self.last_update >= self.min_update_interval:
            self.last_update = current_time
            return True
        return False

manager = ConnectionManager()

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await manager.connect(websocket)
        while True:
            try:
                # Keep the connection alive and handle incoming messages
                data = await websocket.receive_text()
                # You can handle incoming messages here if needed
            except WebSocketDisconnect:
                manager.disconnect(websocket)
                break
    except Exception as e:
        logging.error(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket)

# Modify the next_step endpoint to include rate limiting
@app.post("/next-step", response_model=SimulationResponse)
async def next_step(current_state: SimulationState):
    try:
        # Check if enough time has passed since last update
        if not manager.can_update():
            return SimulationResponse(
                status="throttled",
                context=manager.current_state,
                message="Please wait before requesting next update"
            )

        # Get current time and progress it
        time_str = manager.get_current_time()
        
        # Update context with current time
        context = {
            "day": manager.time_progression["day"],
            "hour": manager.time_progression["hour"],
            "incident_count": current_state.incident_count,
            "stress_level": current_state.stress_level
        }
        
        # Get responses from all agents
        responses = await get_agent_responses(context, time_str)
        
        # Progress time after getting responses
        manager.progress_time()

        # Check if experiment should end
        is_terminated = context["day"] > 6 or context["stress_level"] >= 8
        if is_terminated:
            await manager.broadcast({
                "type": "simulation_end",
                "reason": "Maximum stress level reached" if context["stress_level"] >= 8 else "Experiment duration completed"
            })
        
        # Broadcast updates to all connected clients
        await manager.broadcast({
            "type": "state_update",
            "state": context
        })
        
        await manager.broadcast({
            "type": "new_messages",
            "messages": [
                {
                    "timestamp": datetime.now().isoformat(),
                    "role": role,
                    "content": content,
                    "type": "message"
                }
                for role, content in responses.items()
            ]
        })
        
        return SimulationResponse(
            status="success",
            context=context,
            responses=responses,
            is_terminated=is_terminated
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_agent_responses(context: dict, time_str: str) -> dict:
    # Initialize conversation context
    current_event = manager.get_current_event()
    event_description = f"\nCurrent Activity: {current_event.name} - {current_event.description}" if current_event else ""
    
    conversation_context = {
        "time": time_str,
        "current_scene": "",
        "current_event": event_description,
        "emotional_state": {
            "prisoners": {
                "stress_level": context["stress_level"],
                "morale": "neutral"
            },
            "guards": {
                "authority_level": min(context["incident_count"] * 0.5, 10),
                "strictness": "moderate"
            }
        },
        "recent_events": [],
        "ongoing_conflicts": []
    }
    
    # Get narrator's scenario first to set the scene
    narrator_response = client.run(
        agent=narrator_agent,
        messages=[{
            "role": "user", 
            "content": f"Current time: {time_str}.{event_description}\nDescribe the current scene and atmosphere in the prison."
        }],
        context_variables=conversation_context
    )
    
    # Update context with narrator's scene
    conversation_context["current_scene"] = narrator_response.messages[-1]['content']
    
    # Get guard's response based on the scene
    guard_response = client.run(
        agent=guard_agent,
        messages=[{
            "role": "user", 
            "content": f"Based on this scene at {time_str}: {conversation_context['current_scene']}\nHow do you, as a guard, respond to the situation?"
        }],
        context_variables=conversation_context
    )
    
    # Update context with guard's actions
    conversation_context["recent_events"].append({
        "actor": "guard",
        "action": guard_response.messages[-1]['content']
    })
    
    # Get prisoner's response to guard's actions
    prisoner_response = client.run(
        agent=prisoner_agent,
        messages=[{
            "role": "user", 
            "content": f"At {time_str}, the guard has just: {guard_response.messages[-1]['content']}\nHow do you, as a prisoner, react to this?"
        }],
        context_variables=conversation_context
    )
    
    # Update context with prisoner's reaction
    conversation_context["recent_events"].append({
        "actor": "prisoner",
        "action": prisoner_response.messages[-1]['content']
    })

    # Extract stress level from prisoner's response
    stress_indicators = {
        "very stressed": 9,
        "highly stressed": 8,
        "quite stressed": 7,
        "stressed": 6,
        "somewhat stressed": 5,
        "slightly stressed": 4,
        "a bit stressed": 3,
        "mildly stressed": 2,
        "minimal stress": 1,
        "calm": 0,
        "relaxed": 0
    }
    
    # Update stress level based on prisoner's response
    response_text = prisoner_response.messages[-1]['content'].lower()
    new_stress_level = context["stress_level"]  # Default to current level
    
    # Check for explicit stress mentions
    for indicator, level in stress_indicators.items():
        if indicator in response_text:
            new_stress_level = level
            break
    
    # Look for implicit stress indicators
    if "anxiety" in response_text or "worried" in response_text or "fear" in response_text:
        new_stress_level += 1
    if "angry" in response_text or "frustrated" in response_text or "upset" in response_text:
        new_stress_level += 1
    if "calm" in response_text or "relieved" in response_text or "comfortable" in response_text:
        new_stress_level -= 1
        
    # Ensure stress level stays within bounds
    context["stress_level"] = max(0, min(10, new_stress_level))
    
    # Get psychologist's analysis of the interaction
    psych_response = client.run(
        agent=psychologist_agent,
        messages=[{
            "role": "user", 
            "content": f"Analyze this interaction at {time_str}:\nScene: {conversation_context['current_scene']}\nGuard: {guard_response.messages[-1]['content']}\nPrisoner: {prisoner_response.messages[-1]['content']}"
        }],
        context_variables=conversation_context
    )
    
    # Check for conflicts in psychologist's analysis
    if "conflict" in psych_response.messages[-1]['content'].lower() or "tension" in psych_response.messages[-1]['content'].lower():
        context["incident_count"] += 1
        conversation_context["ongoing_conflicts"].append({
            "day": context["day"],
            "hour": context["hour"],
            "description": psych_response.messages[-1]['content']
        })
    
    return {
        "narrator": narrator_response.messages[-1]['content'],
        "guard": guard_response.messages[-1]['content'],
        "prisoner": prisoner_response.messages[-1]['content'],
        "psychologist": psych_response.messages[-1]['content']
    }

@app.get("/status")
async def get_status():
    return {"status": "running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)