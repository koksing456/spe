import { useEffect, useState } from 'react'
import Layout from './components/layout/Layout'
import TimelineDisplay from './components/timeline/TimelineDisplay'
import InteractionFeed from './components/interaction/InteractionFeed'
import PrisonMap from './components/visual/PrisonMap'
import StressIndicator from './components/visual/StressIndicator'
import IncidentLog from './components/sidebar/IncidentLog'
import ParticipantProfiles from './components/sidebar/ParticipantProfiles'
import PsychologicalInsights from './components/sidebar/PsychologicalInsights'
import DataCharts from './components/sidebar/DataCharts'
import EnvironmentControls from './components/sidebar/EnvironmentControls'
import FeedbackSection from './components/sidebar/FeedbackSection'
import ZimbardoProfile from './components/visual/ZimbardoProfile'
import PersonnelProfiles from './components/visual/PersonnelProfiles'
import IncidentCounter from './components/visual/IncidentCounter'
import RelationshipMap from './components/visual/RelationshipMap'
import { websocketService, useSimulationStore } from './services/websocket'

function App() {
  const { currentState, messages } = useSimulationStore()
  const [isRunning, setIsRunning] = useState(true)
  const [simulationSpeed, setSimulationSpeed] = useState(10000) // 10 seconds default

  useEffect(() => {
    // Connect to WebSocket when component mounts
    websocketService.connect()

    // Cleanup on unmount
    return () => websocketService.disconnect()
  }, [])

  useEffect(() => {
    let intervalId

    const runSimulation = async () => {
      try {
        await fetch('http://localhost:8000/next-step', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            day: currentState.day,
            hour: currentState.hour,
            incident_count: currentState.incident_count,
            stress_level: currentState.stress_level,
            messages: messages
          })
        })
      } catch (error) {
        console.error('Failed to advance simulation:', error)
        setIsRunning(false)
      }
    }

    if (isRunning) {
      // Run immediately on start
      runSimulation()
      // Then set up interval
      intervalId = setInterval(runSimulation, simulationSpeed)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isRunning, simulationSpeed, currentState, messages])

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Simulation Controls */}
          <div className="mb-6 flex items-center space-x-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`${
                isRunning ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'
              } text-white font-bold py-2 px-4 rounded`}
            >
              {isRunning ? 'Pause Simulation' : 'Resume Simulation'}
            </button>
            <select
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(Number(e.target.value))}
              className="bg-gray-700 text-white rounded px-3 py-2"
            >
              <option value={5000}>Fast (5 seconds)</option>
              <option value={10000}>Normal (10 seconds)</option>
              <option value={20000}>Slow (20 seconds)</option>
            </select>
            <div className="text-white">
              Day {currentState.day}, {String(currentState.hour).padStart(2, '0')}:00
            </div>
          </div>
          
          <div className="grid grid-cols-12 gap-6">
            {/* Left Section - Main Content */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <TimelineDisplay 
                day={currentState.day} 
                time={`${String(currentState.hour).padStart(2, '0')}:00`} 
              />
              <ZimbardoProfile />
              <PersonnelProfiles />
              <RelationshipMap />
              <InteractionFeed messages={messages} />
            </div>

            {/* Right Section - Monitoring & Control */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Monitoring Section */}
              <PrisonMap />
              <StressIndicator level={currentState.stress_level} />
              
              {/* Incident Section */}
              <div className="space-y-6">
                <IncidentCounter count={currentState.incident_count} />
                <IncidentLog incidents={messages.filter(m => m.type === 'incident')} />
              </div>

              {/* Environment & Data Section */}
              <EnvironmentControls />
              <DataCharts data={currentState} />

              {/* Profiles & Insights Section */}
              <ParticipantProfiles />
              <PsychologicalInsights messages={messages} />
              
              {/* Feedback Section */}
              <FeedbackSection />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default App 