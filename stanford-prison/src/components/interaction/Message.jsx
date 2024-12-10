import { motion } from 'framer-motion'
import { portraitPaths } from '../../utils/portraitPaths'
import { soundManager } from '../../../public/sounds/soundEffects'

export default function Message({ role, content, timestamp }) {
  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'narrator':
        return 'text-blue-500'
      case 'guard':
        return 'text-red-500'
      case 'prisoner':
        return 'text-gray-400'
      case 'psychologist':
        return 'text-green-500'
      default:
        return 'text-gray-300'
    }
  }

  const getRoleGlow = (role) => {
    switch (role.toLowerCase()) {
      case 'narrator':
        return 'shadow-blue-500/20'
      case 'guard':
        return 'shadow-red-500/20'
      case 'prisoner':
        return 'shadow-gray-500/20'
      case 'psychologist':
        return 'shadow-green-500/20'
      default:
        return 'shadow-gray-500/20'
    }
  }

  const paths = portraitPaths[role.toLowerCase()]

  const handleHover = () => {
    soundManager.playUI('hover')
  }

  return (
    <motion.div 
      className="flex items-start space-x-4 relative"
      whileHover="hover"
      onHoverStart={handleHover}
    >
      <motion.div 
        className={`flex-shrink-0 relative shadow-lg ${getRoleGlow(role)}`}
        whileHover={{ scale: 1.1 }}
      >
        <motion.div 
          className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-700 relative bg-gray-900"
          variants={{
            hover: {
              borderColor: getRoleColor(role).replace('text-', 'rgb('),
              transition: { duration: 0.2 }
            }
          }}
        >
          <motion.svg 
            className={`w-full h-full ${getRoleColor(role)}`} 
            viewBox="0 0 100 100"
            variants={{
              hover: {
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.5 }
              }
            }}
          >
            {/* Base face with animation */}
            <motion.path
              d={paths.face}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            
            {/* Features with animation */}
            <motion.path
              d={paths.features}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />

            {/* Additional elements with hover effects */}
            {paths.hat && (
              <motion.path
                d={paths.hat}
                fill="currentColor"
                variants={{
                  hover: { y: -2, transition: { duration: 0.3 } }
                }}
              />
            )}
            {paths.glasses && (
              <motion.path
                d={paths.glasses}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                variants={{
                  hover: { scale: 1.1, transition: { duration: 0.3 } }
                }}
              />
            )}
            {paths.head && (
              <motion.path
                d={paths.head}
                fill="currentColor"
                variants={{
                  hover: { scale: 1.05, transition: { duration: 0.3 } }
                }}
              />
            )}
            {paths.notepad && (
              <motion.path
                d={paths.notepad}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                variants={{
                  hover: { rotate: 5, transition: { duration: 0.3 } }
                }}
              />
            )}
            {paths.hair && (
              <motion.path
                d={paths.hair}
                fill="currentColor"
                variants={{
                  hover: { y: -1, transition: { duration: 0.3 } }
                }}
              />
            )}
          </motion.svg>
        </motion.div>

        {/* Glow effect */}
        <motion.div
          className="absolute -inset-1 rounded-lg opacity-0"
          style={{
            background: `radial-gradient(circle, ${getRoleColor(role).replace('text-', 'rgb(')}), transparent)`,
            filter: 'blur(8px)'
          }}
          variants={{
            hover: {
              opacity: 0.3,
              transition: { duration: 0.3 }
            }
          }}
        />
      </motion.div>

      <div className="flex-1">
        <motion.div 
          className="flex items-center justify-between"
          variants={{
            hover: {
              x: 5,
              transition: { duration: 0.2 }
            }
          }}
        >
          <motion.span 
            className={`font-medium capitalize ${getRoleColor(role)}`}
            variants={{
              hover: {
                scale: 1.05,
                transition: { duration: 0.2 }
              }
            }}
          >
            {role === 'narrator' ? 'Dr. Zimbardo' : role}
          </motion.span>
          <span className="text-sm text-gray-500">{timestamp}</span>
        </motion.div>
        
        <motion.p 
          className="mt-1 text-gray-300"
          variants={{
            hover: {
              x: 3,
              transition: { duration: 0.2 }
            }
          }}
        >
          {content}
        </motion.p>
      </div>
    </motion.div>
  )
}