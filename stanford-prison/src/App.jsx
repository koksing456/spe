import { useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
import LandingPage from './components/LandingPage'
import { websocketService, useSimulationStore } from './services/websocket'
import NeuralNetwork from './utils/neuralNetwork'
import { soundManager } from '../public/sounds/soundEffects'

const SimulationDashboard = () => {
  const { currentState, messages } = useSimulationStore()
  const canvasRef = useRef(null)
  const networkRef = useRef(null)

  useEffect(() => {
    websocketService.connect()
    soundManager.initialize()
    soundManager.setEnabled(true)
    soundManager.crossfadeAmbient('main')

    return () => {
      websocketService.disconnect()
      soundManager.stopAll()
    }
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const container = canvas.parentElement
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight

      networkRef.current = new NeuralNetwork(canvas, {
        nodeCount: 30,
        nodeColor: '#8B5CF6',
        connectionColor: 'rgba(139, 92, 246, 0.2)',
        mouseInfluence: 150,
        mouseRepulsion: true
      })

      const animate = () => {
        networkRef.current.animate()
        requestAnimationFrame(animate)
      }
      animate()

      const handleResize = () => {
        canvas.width = container.offsetWidth
        canvas.height = container.offsetHeight
        networkRef.current.resize(canvas.width, canvas.height)
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleHover = () => {
    soundManager.playUI('hover')
  }

  const handleClick = () => {
    soundManager.playUI('click')
  }

  return (
    <Layout>
      <div className="relative min-h-screen bg-gray-900 overflow-hidden">
        {/* Neural Network Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.15 }}
        />

        <div className="relative w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Time Display */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gray-800 bg-opacity-90 p-4 rounded-lg border border-purple-500/30 backdrop-blur-sm"
          >
            <motion.div
              className="text-white font-bold text-xl text-center"
              whileHover={{ scale: 1.05 }}
              onHoverStart={handleHover}
            >
              Stanford Prison Experiment - Day {currentState.day}
            </motion.div>
            <div className="text-gray-400 text-center mt-1">
              Current Time: {String(currentState.hour).padStart(2, '0')}:00
            </div>
            <div className="text-gray-500 text-sm text-center mt-1">
              Updates every 4 hours
            </div>
          </motion.div>
          
          <div className="grid grid-cols-12 gap-6">
            {/* Primary Content - Main Interaction Area */}
            <motion.div
              className="col-span-12 lg:col-span-8 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Core Components */}
              <div className="space-y-4">
                <TimelineDisplay 
                  day={currentState.day} 
                  time={`${String(currentState.hour).padStart(2, '0')}:00`} 
                />
                <InteractionFeed messages={messages} />
              </div>

              {/* Secondary Components */}
              <motion.div
                className="space-y-4 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <ZimbardoProfile />
                <PersonnelProfiles />
                {/* <RelationshipMap /> */}
              </motion.div>
            </motion.div>

            {/* Sidebar - Monitoring & Analysis */}
            <motion.div
              className="col-span-12 lg:col-span-4 space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Critical Metrics */}
              <motion.div
                className="space-y-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg border border-purple-500/30 backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                onHoverStart={handleHover}
                onClick={handleClick}
              >
                <h2 className="text-white font-bold text-lg">Critical Metrics</h2>
                <StressIndicator level={currentState.stress_level} />
                <IncidentCounter count={currentState.incident_count} />
                <IncidentLog incidents={messages.filter(m => m.type === 'incident')} />
              </motion.div>

              {/* Environment & Analysis */}
              <motion.div
                className="space-y-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg border border-purple-500/30 backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                onHoverStart={handleHover}
                onClick={handleClick}
              >
                <h2 className="text-white font-bold text-lg">Environment</h2>
                <PrisonMap />
                {/* <EnvironmentControls /> */}
                {/* <DataCharts data={currentState} /> */}
              </motion.div>

              {/* Additional Insights */}
              {/* <motion.div
                className="space-y-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg border border-purple-500/30 backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                onHoverStart={handleHover}
                onClick={handleClick}
              >
                <h2 className="text-white font-bold text-lg">Insights & Profiles</h2>
                <ParticipantProfiles />
                <PsychologicalInsights messages={messages} />
                <FeedbackSection />
              </motion.div> */}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulation" element={<SimulationDashboard />} />
      </Routes>
    </Router>
  )
}

export default App 