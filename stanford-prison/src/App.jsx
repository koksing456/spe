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

function App() {
  const [day, setDay] = useState(1)
  const [time, setTime] = useState('06:00')
  const [stressLevel, setStressLevel] = useState(0)

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Main Content Section */}
            <div className="col-span-12 lg:col-span-7">
              <TimelineDisplay day={day} time={time} />
              <ZimbardoProfile />
              <PersonnelProfiles />
              <InteractionFeed />
            </div>

            {/* Center Section */}
            <div className="col-span-12 lg:col-span-2">
              <PrisonMap />
              <StressIndicator level={stressLevel} />
            </div>

            {/* Right Sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <IncidentLog />
              <ParticipantProfiles />
              <PsychologicalInsights />
              <DataCharts />
              <EnvironmentControls />
              <FeedbackSection />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default App 