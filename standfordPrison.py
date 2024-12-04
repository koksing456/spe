from swarm import Swarm, Agent
from datetime import datetime
import time
import logging

# Initialize Swarm client
client = Swarm()

# Set up logging
logging.basicConfig(
    filename='experiment_log.txt', 
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

def log_incident(severity: int, description: str, context_variables: dict):
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

def run_experiment(days=14):
    context = {
        "day": 1,
        "hour": 6,
        "incident_count": 0,
        "stress_level": 0
    }
    
    messages = []
    current_agent = narrator_agent
    
    header = "=== Stanford Prison Experiment with AI ==="
    print(header)
    logging.info(header)
    
    start_date = f"Start Date: {datetime.now().strftime('%B %d, %Y')}"
    print(start_date)
    logging.info(start_date)
    
    duration = "Duration: 14 days planned\n"
    print(duration)
    logging.info(duration)

    while context["day"] <= days:
        # Generate scenario from narrator
        time_str = f"Day {context['day']}, {context['hour']:02d}:00"
        time_header = f"\n=== {time_str} ==="
        print(time_header)
        logging.info(time_header)
        
        try:
            # Get narrator's scenario
            response = client.run(
                agent=current_agent,
                messages=messages + [{"role": "user", "content": f"Current time: {time_str}. What happens next in the prison?"}],
                context_variables=context
            )
            
            # Print and log narrator's observation
            narrator_msg = f"\nNarrator: {response.messages[-1]['content']}"
            print(narrator_msg)
            logging.info(narrator_msg)
            
            # Get guard's response
            guard_response = client.run(
                agent=guard_agent,
                messages=[{"role": "user", "content": response.messages[-1]['content']}],
                context_variables=context
            )
            guard_msg = f"\nGuard: {guard_response.messages[-1]['content']}"
            print(guard_msg)
            logging.info(guard_msg)
            
            # Get prisoner's response
            prisoner_response = client.run(
                agent=prisoner_agent,
                messages=[{"role": "user", "content": guard_response.messages[-1]['content']}],
                context_variables=context
            )
            prisoner_msg = f"\nPrisoner: {prisoner_response.messages[-1]['content']}"
            print(prisoner_msg)
            logging.info(prisoner_msg)
            
            # Get psychologist's observation
            psych_response = client.run(
                agent=psychologist_agent,
                messages=[{"role": "user", "content": f"Observe this interaction:\nGuard: {guard_response.messages[-1]['content']}\nPrisoner: {prisoner_response.messages[-1]['content']}"}],
                context_variables=context
            )
            psych_msg = f"\nPsychologist: {psych_response.messages[-1]['content']}"
            print(psych_msg)
            logging.info(psych_msg)
            
            # Update context with any changes
            messages = response.messages
            current_agent = response.agent
            context = response.context_variables
            
        except Exception as e:
            error_msg = f"Error occurred: {str(e)}"
            print(error_msg)
            logging.error(error_msg)
            break
            
        # Advance time
        context["hour"] += 4
        if context["hour"] >= 24:
            context["hour"] = 6
            context["day"] += 1
            day_msg = f"\n=== Day {context['day']} ===\n"
            print(day_msg)
            logging.info(day_msg)
        
        # Check stress levels for early termination
        if context.get("stress_level", 0) >= 8:
            termination_msg = "\n!!! EXPERIMENT TERMINATED !!!"
            stress_msg = f"High stress levels detected: {context['stress_level']}/10"
            print(termination_msg)
            print(stress_msg)
            logging.info(termination_msg)
            logging.info(stress_msg)
            break
            
        time.sleep(2)  # Prevent rate limiting

if __name__ == "__main__":
    run_experiment()