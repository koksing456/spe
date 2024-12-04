import { motion } from 'framer-motion'

export default function PsychologicalInsights() {
  const insights = [
    {
      timestamp: '06:30',
      observation: 'Initial guard-prisoner interactions show emerging power dynamics',
      recommendation: 'Monitor for escalation patterns'
    }
  ]

  return (
    <div className="prison-card">
      <h2>Psychological Insights</h2>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="prison-card-content border-l-4 border-green-500 pl-3"
          >
            <div className="text-sm prison-text-secondary">{insight.timestamp}</div>
            <p className="text-sm font-medium prison-text mt-1">{insight.observation}</p>
            <p className="text-sm prison-text-secondary mt-1">{insight.recommendation}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 