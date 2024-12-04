import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function IncidentCounter() {
  const [incidents, setIncidents] = useState({
    behavioral: { count: 0, label: 'Behavioral', color: 'yellow' },
    conflict: { count: 0, label: 'Conflict', color: 'red' },
    resistance: { count: 0, label: 'Resistance', color: 'purple' },
    compliance: { count: 0, label: 'Compliance', color: 'green' }
  })

  const [recentIncident, setRecentIncident] = useState(null)

  // Simulated incident data - in real app, this would come from a central state management
  useEffect(() => {
    const timer = setInterval(() => {
      const types = ['behavioral', 'conflict', 'resistance', 'compliance']
      const randomType = types[Math.floor(Math.random() * types.length)]
      
      addIncident(randomType)
    }, 30000) // Add random incident every 30 seconds

    return () => clearInterval(timer)
  }, [])

  const addIncident = (type) => {
    setIncidents(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        count: prev[type].count + 1
      }
    }))
    
    // Show alert for new incident
    setRecentIncident({
      type,
      timestamp: new Date().toLocaleTimeString()
    })

    // Clear alert after 3 seconds
    setTimeout(() => {
      setRecentIncident(null)
    }, 3000)
  }

  const getIncidentColor = (color) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-500'
      case 'red': return 'bg-red-500'
      case 'purple': return 'bg-purple-500'
      case 'green': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="prison-card mb-6">
      <h2>Incident Monitor</h2>
      
      {/* Incident Counters */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {Object.entries(incidents).map(([key, incident]) => (
          <motion.div
            key={key}
            className="prison-card-content p-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <span className="prison-text text-sm">{incident.label}</span>
              <div className={`w-3 h-3 rounded-full ${getIncidentColor(incident.color)}`} />
            </div>
            <div className="text-2xl font-bold prison-text mt-1">
              {incident.count}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Incident Alert */}
      <AnimatePresence>
        {recentIncident && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 prison-card-content p-3 border-l-4 border-yellow-500"
          >
            <div className="flex items-center justify-between">
              <span className="prison-text text-sm">New {incidents[recentIncident.type].label} Incident</span>
              <span className="prison-text-secondary text-xs">{recentIncident.timestamp}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 