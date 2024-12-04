import { motion } from 'framer-motion'

export default function TimelineDisplay({ day, time }) {
  return (
    <div className="prison-card mb-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold prison-text"
      >
        Day {day}
      </motion.div>
      <div className="text-2xl prison-text-secondary">{time}</div>
      
      {/* Progress Bar */}
      <div className="mt-4 h-2 bg-gray-700 rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(day / 14) * 100}%` }}
          className="h-full bg-purple-600 rounded-full"
        />
      </div>
    </div>
  )
} 