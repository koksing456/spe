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

  useEffect(() => {
    websocketService.connect()
    return () => websocketService.disconnect()
  }, [])

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Time Display */}
          <div className="mb-6 bg-gray-800 p-4 rounded-lg">
            <div className="text-white font-bold text-xl text-center">
              Stanford Prison Experiment - Day {currentState.day}
            </div>
            <div className="text-gray-400 text-center mt-1">
              Current Time: {String(currentState.hour).padStart(2, '0')}:00
            </div>
            <div className="text-gray-500 text-sm text-center mt-1">
              Updates every 4 hours
            </div>
          </div>
          
          <div className="grid grid-cols-12 gap-6">
            {/* Primary Content - Main Interaction Area */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Core Components */}
              <div className="space-y-4">
                <TimelineDisplay 
                  day={currentState.day} 
                  time={`${String(currentState.hour).padStart(2, '0')}:00`} 
                />
                <InteractionFeed messages={messages} />
              </div>

              {/* Secondary Components */}
              <div className="space-y-4 mt-8">
                <ZimbardoProfile />
                <PersonnelProfiles />
                <RelationshipMap />
              </div>
            </div>

            {/* Sidebar - Monitoring & Analysis */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Critical Metrics */}
              <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
                <h2 className="text-white font-bold text-lg">Critical Metrics</h2>
                <StressIndicator level={currentState.stress_level} />
                <IncidentCounter count={currentState.incident_count} />
                <IncidentLog incidents={messages.filter(m => m.type === 'incident')} />
              </div>

              {/* Environment & Analysis */}
              <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
                <h2 className="text-white font-bold text-lg">Environment</h2>
                <PrisonMap />
                <EnvironmentControls />
                <DataCharts data={currentState} />
              </div>

              {/* Additional Insights */}
              <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
                <h2 className="text-white font-bold text-lg">Insights & Profiles</h2>
                <ParticipantProfiles />
                <PsychologicalInsights messages={messages} />
                <FeedbackSection />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default App 