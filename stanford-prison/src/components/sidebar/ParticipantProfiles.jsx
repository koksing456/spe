import { motion } from 'framer-motion'
import Avatar from '../visual/Avatar'

export default function ParticipantProfiles() {
  const participants = [
    {
      role: 'guard',
      number: '1',
      stressLevel: 3,
      status: 'On Duty',
      lastAction: 'Conducting roll call'
    },
    {
      role: 'prisoner',
      number: '8612',
      stressLevel: 5,
      status: 'In Cell',
      lastAction: 'Requested bathroom break'
    }
  ]

  return (
    <div className="prison-card">
      <h2>Participant Profiles</h2>
      <div className="space-y-4">
        {participants.map((participant, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-3 p-3 prison-card-content"
          >
            <Avatar role={participant.role} />
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-medium capitalize prison-text">
                  {participant.role} #{participant.number}
                </span>
                <span className="text-sm prison-text-secondary">{participant.status}</span>
              </div>
              <div className="mt-1 text-sm prison-text-secondary">
                {participant.lastAction}
              </div>
              <div className="mt-2 h-2 bg-gray-700 rounded-full">
                <div
                  className={`h-full rounded-full ${
                    participant.stressLevel < 4 ? 'bg-green-500' :
                    participant.stressLevel < 7 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${participant.stressLevel * 10}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 