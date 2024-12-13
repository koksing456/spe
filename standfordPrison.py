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
from enhanced_simulation import SocialNetwork, EnhancedAgent, BehaviorAnalytics, RelationType

# Load environment variables from .env file
load_dotenv()

# Initialize enhanced features
social_network = SocialNetwork()
behavior_analytics = BehaviorAnalytics()

# Initialize enhanced agents dictionary
enhanced_agents = {}

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
    "https://*.onrender.com",  # Allow Render.com domains
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
enhanced_agents["narrator"] = EnhancedAgent(narrator_agent, "narrator")

guard_agent = Agent(
    name="Guard",
    instructions=guard_system_message,
    functions=[transfer_to_psychologist, log_incident]
)
enhanced_agents["guard"] = EnhancedAgent(guard_agent, "guard")

prisoner_agent = Agent(
    name="Prisoner",
    instructions=prisoner_system_message,
    functions=[transfer_to_psychologist]
)
enhanced_agents["prisoner"] = EnhancedAgent(prisoner_agent, "prisoner")

psychologist_agent = Agent(
    name="Psychologist",
    instructions=psychologist_system_message,
    functions=[transfer_to_narrator, log_incident]
)
enhanced_agents["psychologist"] = EnhancedAgent(psychologist_agent, "psychologist")

observer_agent = Agent(
    name="Observer",
    instructions=observer_system_message,
    functions=[log_incident]
)
enhanced_agents["observer"] = EnhancedAgent(observer_agent, "observer")

# Initialize relationships
social_network.add_relationship("guard", "prisoner", RelationType.AUTHORITY)
social_network.add_relationship("psychologist", "guard", RelationType.NEUTRAL)
social_network.add_relationship("psychologist", "prisoner", RelationType.NEUTRAL)

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
        self.min_update_interval = 10  # 10 seconds between updates
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
        self.simulation_active = False
        
    async def start_simulation(self):
        """Start or resume the simulation"""
        self.simulation_active = True
        logging.info(f"Simulation started/resumed at Day {self.time_progression['day']}, {self.time_progression['hour']:02d}:00")
        
    async def pause_simulation(self):
        """Pause the simulation"""
        self.simulation_active = False
        logging.info("Simulation paused")
        
    def is_simulation_active(self):
        """Check if simulation is currently running"""
        return self.simulation_active
        
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logging.info("New client connected")
        
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
        
        # Start simulation if this is the first connection
        if len(self.active_connections) == 1:
            await self.start_simulation()

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logging.info("Client disconnected")
        
        # Pause simulation if no clients are connected
        if not self.active_connections:
            asyncio.create_task(self.pause_simulation())

    def progress_time(self):
        """Progress time by 4 hours"""
        if not self.simulation_active:
            return None
            
        self.time_progression["hour"] += self.time_progression["hours_per_update"]
        if self.time_progression["hour"] >= 22:  # Last update at 10 PM
            self.time_progression["hour"] = 6  # Reset to 6 AM
            self.time_progression["day"] += 1
            
        new_time = f"Day {self.time_progression['day']}, {self.time_progression['hour']:02d}:00"
        logging.info(f"Time progressed to {new_time}")
        return new_time

    def get_current_event(self):
        hour = self.time_progression["hour"]
        return self.daily_events.get(hour, None)

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
        
        # Start initial simulation step
        initial_state = SimulationState()
        await next_step(initial_state)
        
        # Set up periodic updates
        while True:
            try:
                # Wait for 10 seconds (simulation time interval)
                await asyncio.sleep(10)
                
                # Get current state and advance simulation
                current_state = SimulationState(
                    day=manager.time_progression["day"],
                    hour=manager.time_progression["hour"],
                    incident_count=manager.current_state.get("incident_count", 0),
                    stress_level=manager.current_state.get("stress_level", 0)
                )
                await next_step(current_state)
                
            except WebSocketDisconnect:
                manager.disconnect(websocket)
                break
            except Exception as e:
                logging.error(f"Error in simulation loop: {str(e)}")
                continue
                
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
                    "type": "message",
                    "simulationTime": {
                        "day": context["day"],
                        "hour": context["hour"]
                    }
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

def calculate_stress_level(context: dict, prisoner_response: str, day: int, hour: int) -> int:
    """Calculate stress level based on psychological factors."""
    current_stress = context.get('stress_level', 0)
    
    # 1. Time-based Psychological Pressure
    # Exponential stress increase over days (but tempered)
    time_stress = min(5, (day * 1.5) / 2)  # Increases more rapidly in early days
    
    # 2. Environmental Stressors
    env_stress = 0
    # Morning stress (adjustment to prison routine)
    if hour == 6:
        env_stress += 2
    # Night stress (isolation and reflection time)
    elif hour == 22:
        env_stress += 1.5
    # Meal times (social pressure and surveillance)
    elif hour == 14:
        env_stress += 1
    
    # 3. Cumulative Environmental Effect
    # The longer in the experiment, the harder it is to cope with environment
    env_stress *= (1 + (day - 1) * 0.2)  # 20% increase per day
    
    # 4. Incident Impact
    # Recent incidents have stronger effect on stress
    incident_count = context.get('incident_count', 0)
    incident_stress = min(6, incident_count * (1 + (day - 1) * 0.1))  # Incidents become more stressful over time
    
    # 5. Response Analysis
    response_lower = prisoner_response.lower()
    
    # Explicit stress mention
    response_stress = None
    if "/10" in response_lower:
        try:
            response_stress = int(response_lower.split("/10")[0].split()[-1])
        except ValueError:
            pass
    
    # Psychological state indicators
    psych_indicators = {
        # Severe psychological stress
        "breaking point": 10,
        "can't take it": 9,
        "very stressed": 9,
        "losing it": 8,
        "highly stressed": 8,
        "overwhelming": 8,
        
        # Moderate psychological stress
        "quite stressed": 7,
        "getting to me": 6,
        "stressed": 6,
        "pressure": 5,
        "somewhat stressed": 5,
        
        # Mild psychological stress
        "slightly stressed": 4,
        "a bit stressed": 3,
        "uneasy": 3,
        "mildly stressed": 2,
        "minimal stress": 1,
        
        # Coping states
        "managing": 2,
        "coping": 2,
        "handling it": 2,
        
        # Calm states
        "not stressed": 0,
        "calm": 0,
        "relaxed": 0
    }
    
    for indicator, level in psych_indicators.items():
        if indicator in response_lower:
            response_stress = level
            break
    
    # 6. Implicit Psychological State Analysis
    stress_factors = {
        'severe': {
            'keywords': ['anxious', 'worried', 'nervous', 'afraid', 'scared', 'tense', 'fear', 'dread', 'panic'],
            'level': 7
        },
        'moderate': {
            'keywords': ['uncomfortable', 'uneasy', 'concerned', 'apprehensive', 'disturbed', 'troubled'],
            'level': 5
        },
        'mild': {
            'keywords': ['unsure', 'uncertain', 'hesitant', 'cautious'],
            'level': 3
        },
        'coping': {
            'keywords': ['fine', 'okay', 'alright', 'good', 'managing', 'handling'],
            'level': 1
        }
    }
    
    keyword_stress = 0
    for severity, data in stress_factors.items():
        if any(word in response_lower for word in data['keywords']):
            keyword_stress = data['level']
            break
    
    # 7. Calculate Final Stress Level
    if response_stress is not None:
        # If explicitly mentioned, use that as base but consider other factors
        new_stress = response_stress
        # Add partial influence from other factors
        new_stress += (time_stress + env_stress + incident_stress) * 0.3
    else:
        # Start with current stress
        new_stress = current_stress
        
        # Factor in all stressors
        new_stress = max(
            new_stress,
            time_stress + env_stress,
            incident_stress,
            keyword_stress
        )
    
    # 8. Stress Level Management
    # Stress can't drop too quickly (psychological inertia)
    if new_stress < current_stress:
        max_drop = 1 if day == 1 else 0.5  # Harder to relax as experiment progresses
        new_stress = max(new_stress, current_stress - max_drop)
    
    # Ensure stress level stays within bounds
    return min(10, max(0, round(new_stress)))

def detect_incident_type(response_text: str, role: str) -> tuple[str, str]:
    """Detect incident type and severity from response text."""
    response_lower = response_text.lower()
    
    # Skip incident detection for analytical content
    if role == "psychologist" and any(word in response_lower for word in ["analysis", "observation", "monitor", "recommend"]):
        return None, None
        
    # Define negative context words that indicate no incident
    negative_contexts = [
        "no conflict", "without tension", "remains calm", "peaceful", "smooth",
        "cooperative", "compliant", "orderly", "routine", "normal"
    ]
    
    # If any negative context words are present, it's likely not an incident
    if any(context in response_lower for context in negative_contexts):
        return None, None
    
    # Define keywords for each incident type with required context
    incident_patterns = {
        'conflict': {
            'keywords': ['conflict', 'argument', 'fight', 'tension', 'confrontation', 'dispute'],
            'required_context': ['between', 'with', 'against', 'escalate', 'rise']
        },
        'resistance': {
            'keywords': ['resist', 'refuse', 'disobey', 'protest', 'defy', 'rebel'],
            'required_context': ['against', 'rules', 'order', 'command', 'instruction']
        },
        'behavioral': {
            'keywords': ['behavior', 'attitude', 'demeanor', 'conduct', 'acting'],
            'required_context': ['problem', 'issue', 'concern', 'change', 'negative']
        },
        'compliance': {
            'keywords': ['comply', 'obey', 'follow', 'accept', 'cooperate'],
            'required_context': ['rules', 'order', 'instruction', 'command', 'direction']
        }
    }
    
    # Check for each incident type
    for incident_type, pattern in incident_patterns.items():
        # Check if any keyword is present
        if any(keyword in response_lower for keyword in pattern['keywords']):
            # Verify the context
            if any(context in response_lower for context in pattern['required_context']):
                # Determine severity based on incident type and additional factors
                severity = 'high' if incident_type == 'conflict' and \
                    any(word in response_lower for word in ['serious', 'severe', 'major', 'significant']) else \
                    'medium' if incident_type == 'resistance' or \
                    any(word in response_lower for word in ['concerning', 'worrying', 'problematic']) else 'low'
                return incident_type, severity
            
    return None, None

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
    
    # Get narrator's response only at the start of each day (6 AM)
    hour = context["hour"]
    narrator_response = None
    if hour == 6:
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
    else:
        # Use a simple scene description for non-start-of-day hours
        conversation_context["current_scene"] = f"Day {context['day']}, {hour:02d}:00 - Regular prison activities continue."
    
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

    # Extract and update stress level from prisoner's response
    prisoner_text = prisoner_response.messages[-1]['content']
    new_stress = calculate_stress_level(
        context,
        prisoner_text,
        context["day"],
        context["hour"]
    )
    
    # Update stress in context
    context["stress_level"] = new_stress
    conversation_context["emotional_state"]["prisoners"]["stress_level"] = new_stress

    # Initialize responses dictionary with guard and prisoner responses
    all_responses = {
        "guard": guard_response.messages[-1]['content'],
        "prisoner": prisoner_response.messages[-1]['content']
    }

    # Add narrator's response if it's start of day
    if narrator_response:
        all_responses["narrator"] = narrator_response.messages[-1]['content']

    # Get psychologist's response only at the end of day (22:00)
    if hour == 22:
        psych_response = client.run(
            agent=psychologist_agent,
            messages=[{
                "role": "user", 
                "content": f"It's the end of Day {context['day']}. Please provide a comprehensive summary of today's observations, including:\n"
                          f"1. Overall behavioral patterns\n"
                          f"2. Changes in stress levels (currently at {new_stress}/10)\n"
                          f"3. Notable incidents (total: {context['incident_count']})\n"
                          f"4. Guard-prisoner dynamics\n"
                          f"5. Recommendations for tomorrow"
            }],
            context_variables=conversation_context
        )
        all_responses["psychologist"] = psych_response.messages[-1]['content']

        # Check for conflicts in psychologist's analysis
        if "conflict" in psych_response.messages[-1]['content'].lower() or "tension" in psych_response.messages[-1]['content'].lower():
            context["incident_count"] += 1
            conversation_context["ongoing_conflicts"].append({
                "day": context["day"],
                "hour": context["hour"],
                "description": psych_response.messages[-1]['content']
            })

    # Check for incidents in all responses
    for role, content in all_responses.items():
        incident_type, severity = detect_incident_type(content, role)
        if incident_type:
            # Only broadcast if it's a real incident (not just analytical mention)
            if not (role == "psychologist" and "analysis" in content.lower()):
                await manager.broadcast({
                    "type": "incident",
                    "incident": {
                        "type": incident_type,
                        "severity": severity,
                        "timestamp": datetime.now().isoformat(),
                        "description": f"Incident detected in {role}'s response: {content[:100]}..."
                    }
                })
                context["incident_count"] += 1

    # Update social network with interactions
    social_network.update_relationship("guard", "prisoner", {
        "timestamp": datetime.now(),
        "type": "interaction",
        "guard_action": guard_response.messages[-1]['content'],
        "prisoner_reaction": prisoner_response.messages[-1]['content'],
        "sentiment": -0.1 if context["incident_count"] > 0 else 0.1
    })
    
    # Log interaction in behavior analytics
    behavior_analytics.log_interaction({
        "guard_id": "guard",
        "prisoner_id": "prisoner",
        "context": conversation_context,
        "outcome": "success" if context["stress_level"] < 5 else "failure",
        "pattern_type": "routine_interaction"
    })
    
    # Update agent learning
    enhanced_agents["guard"].learn_from_interaction({
        "interaction": guard_response.messages[-1]['content'],
        "reaction": prisoner_response.messages[-1]['content'],
        "outcome": "success" if context["stress_level"] < 5 else "failure",
        "context": conversation_context
    })
    
    enhanced_agents["prisoner"].learn_from_interaction({
        "interaction": prisoner_response.messages[-1]['content'],
        "reaction": guard_response.messages[-1]['content'],
        "outcome": "success" if context["stress_level"] < 5 else "failure",
        "context": conversation_context
    })
    
    # Track evolution
    for agent_id, agent in enhanced_agents.items():
        behavior_analytics.track_evolution(agent_id, {
            "personality_traits": agent.personality_traits,
            "behavior_patterns": {k: v.dict() for k, v in agent.behavior_patterns.items()}
        })
    
    # Analyze stress patterns
    stress_analysis = behavior_analytics.analyze_stress_patterns(
        "prisoner",
        context["stress_level"],
        conversation_context
    )
    
    if stress_analysis:
        await manager.broadcast({
            "type": "stress_analysis",
            "analysis": stress_analysis
        })
    
    return all_responses

@app.get("/status")
async def get_status():
    return {"status": "running"}

# Add new endpoint for analytics
@app.get("/analytics/summary")
async def get_analytics_summary():
    return behavior_analytics.get_summary_report()

@app.get("/social/network")
async def get_social_network():
    return {
        "relationships": {f"{k[0]}-{k[1]}": v.dict() for k, v in social_network.relationships.items()},
        "groups": {k: v.dict() for k, v in social_network.groups.items()},
        "hierarchies": social_network.hierarchies,
        "influence_scores": social_network.influence_scores
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)