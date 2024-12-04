import { useState } from 'react'
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

function App() {
  const [day, setDay] = useState(1)
  const [time, setTime] = useState('06:00')
  const [stressLevel, setStressLevel] = useState(0)

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Section - Main Content */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <TimelineDisplay day={day} time={time} />
              <ZimbardoProfile />
              <PersonnelProfiles />
              <RelationshipMap />
              <InteractionFeed />
            </div>

            {/* Right Section - Monitoring & Control */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Monitoring Section */}
              <PrisonMap />
              <StressIndicator level={stressLevel} />
              
              {/* Incident Section */}
              <div className="space-y-6">
                <IncidentCounter />
                <IncidentLog />
              </div>

              {/* Environment & Data Section */}
              <EnvironmentControls />
              <DataCharts />

              {/* Profiles & Insights Section */}
              <ParticipantProfiles />
              <PsychologicalInsights />
              
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