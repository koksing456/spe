import { motion } from 'framer-motion'

export default function IncidentLog() {
  const incidents = [
    {
      time: '06:15',
      type: 'Behavioral',
      description: 'First signs of guard authority establishment',
      severity: 'low'
    },
    // Add more incidents as needed
  ]

  return (
    <div className="prison-card">
      <h2>Incident Log</h2>
      <div className="space-y-3">
        {incidents.map((incident, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="prison-card-content border-l-4 border-yellow-500 pl-3"
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-200">
                {incident.time}
              </span>
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