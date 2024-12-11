from typing import Dict, List, Optional, Set, Tuple
from datetime import datetime
from enum import Enum
import json
from pydantic import BaseModel

class RelationType(str, Enum):
    ALLIANCE = "alliance"
    CONFLICT = "conflict"
    NEUTRAL = "neutral"
    AUTHORITY = "authority"
    SUBORDINATE = "subordinate"

class Relationship(BaseModel):
    agent1_id: str
    agent2_id: str
    relation_type: RelationType
    strength: float  # 0 to 1
    last_updated: datetime
    interaction_history: List[Dict]

class Group(BaseModel):
    id: str
    members: Set[str]
    leader_id: Optional[str]
    formation_date: datetime
    purpose: str
    cohesion_level: float  # 0 to 1

class SocialNetwork:
    def __init__(self):
        self.relationships: Dict[Tuple[str, str], Relationship] = {}
        self.groups: Dict[str, Group] = {}
        self.hierarchies: Dict[str, List[str]] = {}
        self.influence_scores: Dict[str, float] = {}
    
    def add_relationship(self, agent1_id: str, agent2_id: str, relation_type: RelationType):
        key = tuple(sorted([agent1_id, agent2_id]))
        if key not in self.relationships:
            self.relationships[key] = Relationship(
                agent1_id=agent1_id,
                agent2_id=agent2_id,
                relation_type=relation_type,
                strength=0.1,
                last_updated=datetime.now(),
                interaction_history=[]
            )
    
    def update_relationship(self, agent1_id: str, agent2_id: str, interaction: Dict):
        key = tuple(sorted([agent1_id, agent2_id]))
        if key in self.relationships:
            rel = self.relationships[key]
            rel.interaction_history.append(interaction)
            rel.last_updated = datetime.now()
            # Update relationship strength based on interaction
            sentiment = interaction.get('sentiment', 0)
            rel.strength = min(1.0, max(0.0, rel.strength + sentiment * 0.1))
    
    def form_group(self, member_ids: Set[str], purpose: str) -> str:
        group_id = f"group_{len(self.groups)}"
        self.groups[group_id] = Group(
            id=group_id,
            members=member_ids,
            leader_id=None,
            formation_date=datetime.now(),
            purpose=purpose,
            cohesion_level=0.5
        )
        return group_id
    
    def update_hierarchy(self, group_id: str, hierarchy_list: List[str]):
        self.hierarchies[group_id] = hierarchy_list
        # Update influence scores
        for i, agent_id in enumerate(reversed(hierarchy_list)):
            self.influence_scores[agent_id] = (i + 1) / len(hierarchy_list)

class BehaviorPattern(BaseModel):
    pattern_type: str
    frequency: int
    last_observed: datetime
    context: Dict
    success_rate: float

class EnhancedAgent:
    def __init__(self, base_agent, agent_id: str):
        self.base_agent = base_agent
        self.agent_id = agent_id
        self.learning_history: List[Dict] = []
        self.behavior_patterns: Dict[str, BehaviorPattern] = {}
        self.relationship_memory: Dict[str, List[Dict]] = {}
        self.personality_traits: Dict[str, float] = {
            "authority_preference": 0.5,  # 0: submissive, 1: dominant
            "social_preference": 0.5,     # 0: solitary, 1: social
            "stress_resilience": 0.5,     # 0: fragile, 1: resilient
            "adaptability": 0.5           # 0: rigid, 1: flexible
        }
    
    def learn_from_interaction(self, interaction: Dict):
        self.learning_history.append({
            "timestamp": datetime.now(),
            "interaction": interaction,
            "outcome": interaction.get("outcome"),
            "context": interaction.get("context")
        })
        
        # Update behavior patterns
        pattern_type = interaction.get("pattern_type")
        if pattern_type:
            if pattern_type not in self.behavior_patterns:
                self.behavior_patterns[pattern_type] = BehaviorPattern(
                    pattern_type=pattern_type,
                    frequency=1,
                    last_observed=datetime.now(),
                    context=interaction.get("context", {}),
                    success_rate=1.0 if interaction.get("outcome") == "success" else 0.0
                )
            else:
                pattern = self.behavior_patterns[pattern_type]
                pattern.frequency += 1
                pattern.last_observed = datetime.now()
                pattern.success_rate = (pattern.success_rate * (pattern.frequency - 1) + 
                                      (1.0 if interaction.get("outcome") == "success" else 0.0)) / pattern.frequency
    
    def adapt_personality(self, context: Dict):
        # Adapt personality traits based on experiences
        recent_interactions = self.learning_history[-10:]  # Look at last 10 interactions
        if recent_interactions:
            success_rate = sum(1 for i in recent_interactions if i["outcome"] == "success") / len(recent_interactions)
            
            # Adjust adaptability based on success rate
            if success_rate > 0.7:
                self.personality_traits["adaptability"] = min(1.0, self.personality_traits["adaptability"] + 0.1)
            elif success_rate < 0.3:
                self.personality_traits["adaptability"] = max(0.0, self.personality_traits["adaptability"] - 0.1)

class BehaviorAnalytics:
    def __init__(self):
        self.interaction_log: List[Dict] = []
        self.pattern_analysis: Dict[str, Dict] = {}
        self.evolution_tracking: Dict[str, List[Dict]] = {}
        self.stress_patterns: Dict[str, List[float]] = {}
    
    def log_interaction(self, interaction: Dict):
        self.interaction_log.append({
            "timestamp": datetime.now(),
            **interaction
        })
        
        # Update pattern analysis
        pattern_type = interaction.get("pattern_type")
        if pattern_type:
            if pattern_type not in self.pattern_analysis:
                self.pattern_analysis[pattern_type] = {
                    "count": 1,
                    "success_rate": 1.0 if interaction.get("outcome") == "success" else 0.0,
                    "contexts": [interaction.get("context", {})]
                }
            else:
                pattern = self.pattern_analysis[pattern_type]
                pattern["count"] += 1
                pattern["success_rate"] = (pattern["success_rate"] * (pattern["count"] - 1) + 
                                         (1.0 if interaction.get("outcome") == "success" else 0.0)) / pattern["count"]
                pattern["contexts"].append(interaction.get("context", {}))
    
    def track_evolution(self, agent_id: str, metrics: Dict):
        if agent_id not in self.evolution_tracking:
            self.evolution_tracking[agent_id] = []
        
        self.evolution_tracking[agent_id].append({
            "timestamp": datetime.now(),
            "metrics": metrics
        })
    
    def analyze_stress_patterns(self, agent_id: str, stress_level: float, context: Dict):
        if agent_id not in self.stress_patterns:
            self.stress_patterns[agent_id] = []
        
        self.stress_patterns[agent_id].append(stress_level)
        
        # Analyze stress trends
        if len(self.stress_patterns[agent_id]) >= 5:
            recent_trend = self.stress_patterns[agent_id][-5:]
            trend_direction = "increasing" if recent_trend[-1] > recent_trend[0] else "decreasing"
            return {
                "current_level": stress_level,
                "trend": trend_direction,
                "average": sum(recent_trend) / len(recent_trend),
                "context": context
            }
        return None

    def get_summary_report(self) -> Dict:
        return {
            "total_interactions": len(self.interaction_log),
            "pattern_frequencies": {k: v["count"] for k, v in self.pattern_analysis.items()},
            "agent_evolution": {
                agent_id: {
                    "starting_state": evolution[0]["metrics"] if evolution else None,
                    "current_state": evolution[-1]["metrics"] if evolution else None
                }
                for agent_id, evolution in self.evolution_tracking.items()
            },
            "stress_analysis": {
                agent_id: {
                    "current_level": levels[-1] if levels else None,
                    "average": sum(levels) / len(levels) if levels else None
                }
                for agent_id, levels in self.stress_patterns.items()
            }
        }