import { motion } from 'framer-motion'
import Message from './Message'

export default function InteractionFeed({ messages = [] }) {
  return (
    <div className="prison-card">
      <h2>Interaction Feed</h2>
      <div className="space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={`${message.timestamp}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="prison-card-content"
          >
            <Message {...message} />
          </motion.div>
        ))}
        {messages.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            Waiting for simulation to begin...
          </div>
        )}
      </div>
    </div>
  )
} 