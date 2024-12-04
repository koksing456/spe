import { motion } from 'framer-motion'
import Message from './Message'

export default function InteractionFeed() {
  const messages = [
    {
      role: 'narrator',
      content: 'The experiment begins as the prisoners arrive at the mock prison.',
      timestamp: '06:00',
    },
    {
      role: 'guard',
      content: 'All prisoners must line up for morning roll call.',
      timestamp: '06:15',
    },
    {
      role: 'prisoner',
      content: 'Requesting permission to use the restroom, sir.',
      timestamp: '06:30',
    },
    {
      role: 'psychologist',
      content: 'Notable increase in submissive behavior among prisoners.',
      timestamp: '06:45',
    },
    {
      role: 'observer',
      content: 'Guard #2 showing signs of increased authoritarian behavior.',
      timestamp: '07:00',
    }
  ]

  return (
    <div className="prison-card">
      <h2>Interaction Feed</h2>
      <div className="space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="prison-card-content"
          >
            <Message {...message} />
          </motion.div>
        ))}
      </div>
    </div>
  )
} 