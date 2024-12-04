import { motion } from 'framer-motion'

export default function StressIndicator({ level }) {
  const getStressColor = (level) => {
    if (level < 3) return 'bg-green-500'
    if (level < 7) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="prison-card">
      <h2>Stress Level</h2>
      <div className="relative h-4 bg-gray-700 rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(level / 10) * 100}%` }}
          className={`absolute h-full rounded-full ${getStressColor(level)}`}
        />
      </div>
      <div className="mt-2 prison-text">
        Level: {level}/10
      </div>
    </div>
  )
} 