import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function IncidentLog() {
  const [incidents, setIncidents] = useState([
    {
      time: '',
      type: '',
      description: '',
      severity: ''
    }
  ])

  // Listen for custom event when new incidents occur
  useEffect(() => {
    const handleNewIncident = (event) => {
      const { type, severity = 'low' } = event.detail
      
      // Generate appropriate description based on incident type
      const descriptions = {
        behavioral: 'Observed change in participant behavior',
        conflict: 'Conflict between participants reported',
        resistance: 'Instance of resistance to authority',
        compliance: 'Notable compliance with instructions'
      }

      const newIncident = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: type.charAt(0).toUpperCase() + type.slice(1),
        description: descriptions[type.toLowerCase()],
        severity
      }

      setIncidents(prev => [newIncident, ...prev])
    }

    // Add event listener
    window.addEventListener('newIncident', handleNewIncident)

    // Cleanup
    return () => window.removeEventListener('newIncident', handleNewIncident)
  }, [])

  return (
    <div className="prison-card">
      <h2>Incident Log</h2>
      <div className="space-y-3">
        {incidents.map((incident, index) => (
          <motion.div
            key={`${incident.time}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`prison-card-content border-l-4 pl-3 ${
              incident.type === 'Behavioral' ? 'border-yellow-500' :
              incident.type === 'Conflict' ? 'border-red-500' :
              incident.type === 'Resistance' ? 'border-purple-500' :
              'border-green-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-200">
                  {incident.time}
                </span>
                <span className="text-sm text-gray-400">
                  {incident.type}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                incident.severity === 'low' ? 'bg-yellow-900 text-yellow-200' :
                incident.severity === 'medium' ? 'bg-orange-900 text-orange-200' :
                'bg-red-900 text-red-200'
              }`}>
                {incident.severity}
              </span>
            </div>
            <p className="prison-text mt-1">
              {incident.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 