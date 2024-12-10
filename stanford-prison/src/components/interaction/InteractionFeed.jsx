import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState, useMemo } from 'react'
import Message from './Message'
import { soundManager } from '../../../public/sounds/soundEffects'

const MESSAGES_PER_PAGE = 20
const TIME_GROUP_INTERVAL = 3600000 // 1 hour in milliseconds

export default function InteractionFeed({ messages = [] }) {
  const feedRef = useRef(null)
  const prevMessagesLength = useRef(messages.length)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [visibleMessages, setVisibleMessages] = useState(MESSAGES_PER_PAGE)
  
  // Group messages by time periods
  const groupedMessages = useMemo(() => {
    const groups = {}
    messages.slice(0, visibleMessages).forEach(message => {
      const timestamp = new Date(message.timestamp)
      const groupKey = Math.floor(timestamp.getTime() / TIME_GROUP_INTERVAL)
      if (!groups[groupKey]) {
        groups[groupKey] = {
          timestamp,
          messages: []
        }
      }
      groups[groupKey].messages.push(message)
    })
    return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp)
  }, [messages, visibleMessages])

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      soundManager.playUI('reveal')
      if (feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight
      }
    }
    prevMessagesLength.current = messages.length
  }, [messages])

  const handleScroll = (e) => {
    const element = e.target
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100
    setShowScrollButton(!atBottom)

    // Load more when scrolling near top
    if (element.scrollTop < 100 && visibleMessages < messages.length) {
      loadMore()
    }
  }

  const scrollToBottom = () => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
    soundManager.playUI('click')
  }

  const loadMore = () => {
    setVisibleMessages(prev => Math.min(prev + MESSAGES_PER_PAGE, messages.length))
    soundManager.playUI('discover')
  }

  const formatTimeGroup = (timestamp) => {
    if (!messages.length) return ''
    const date = new Date(timestamp)
    const firstMessageDate = new Date(messages[0].timestamp)
    const dayNumber = Math.floor((date - firstMessageDate) / (24 * 3600000)) + 1
    return `Day ${dayNumber} - ${date.getHours().toString().padStart(2, '0')}:00`
  }

  return (
    <motion.div
      className="prison-card relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-purple-500/50"
        animate={{
          x: [-100, 100],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <div className="flex justify-between items-center mb-4 px-4 pt-4">
        <h2 className="text-2xl font-bold text-white">Interaction Feed</h2>
        <div className="text-sm text-gray-400">
          Showing {Math.min(visibleMessages, messages.length)} of {messages.length} messages
        </div>
      </div>
      
      <div 
        ref={feedRef}
        className="relative max-h-[600px] overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800"
        onScroll={handleScroll}
      >
        {messages.length > MESSAGES_PER_PAGE && visibleMessages < messages.length && (
          <motion.button
            className="w-full py-2 px-4 mb-4 text-sm text-purple-300 bg-purple-900/30 rounded-lg border border-purple-500/20 hover:bg-purple-900/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadMore}
          >
            Load More Messages
          </motion.button>
        )}

        <AnimatePresence mode="popLayout">
          {groupedMessages.map((group, groupIndex) => (
            <motion.div
              key={group.timestamp.getTime()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <motion.div 
                className="sticky top-0 z-10 mb-2 py-1 px-2 text-sm text-gray-400 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                {formatTimeGroup(group.timestamp)}
              </motion.div>

              {group.messages.map((message, index) => (
                <motion.div
                  key={`${message.timestamp}-${index}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 100 
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className="prison-card-content backdrop-blur-sm bg-gray-800/90 border border-purple-500/20 rounded-lg mb-3"
                >
                  <Message {...message} />
                </motion.div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>

        {messages.length === 0 && (
          <motion.div 
            className="text-gray-500 text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.3, 0.7, 0.3],
              scale: [0.98, 1.02, 0.98]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="text-lg">Waiting for simulation to begin...</div>
            <div className="text-sm mt-2 text-gray-600">
              The experiment will commence shortly
            </div>
          </motion.div>
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            className="absolute bottom-6 right-6 p-2 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToBottom}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Decorative elements */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-12 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(17, 24, 39, 0.9))'
        }}
      />
      
      <motion.div
        className="absolute -bottom-2 -right-2 w-32 h-32 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)',
          filter: 'blur(20px)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  )
} 