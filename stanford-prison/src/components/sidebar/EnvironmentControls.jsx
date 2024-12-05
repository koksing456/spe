import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function EnvironmentControls() {
  const [lighting, setLighting] = useState(100)
  const [noise, setNoise] = useState(50)
  const [temperature, setTemperature] = useState(72)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [audioError, setAudioError] = useState(null)
  const [isEmergencyMode, setIsEmergencyMode] = useState(false)
  const fadeIntervalRef = useRef(null)
  
  // Audio reference
  const ambientNoiseRef = useRef(new Audio('/ambient-prison.mp3'))

  // Fade in audio function
  const fadeInAudio = async () => {
    if (!ambientNoiseRef.current) return
    
    ambientNoiseRef.current.volume = 0
    await ambientNoiseRef.current.play()
    setIsAudioPlaying(true)
    
    let vol = 0
    const targetVol = (noise / 100) * (isMuted ? 0 : 1)
    
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
    
    fadeIntervalRef.current = setInterval(() => {
      if (vol < targetVol) {
        vol = Math.min(targetVol, vol + 0.05)
        ambientNoiseRef.current.volume = vol
      } else {
        clearInterval(fadeIntervalRef.current)
      }
    }, 100)
  }

  // Initialize ambient sound
  useEffect(() => {
    ambientNoiseRef.current.loop = true
    
    ambientNoiseRef.current.onerror = (error) => {
      console.error('Audio loading error:', error)
      setAudioError('Failed to load ambient audio')
      setIsAudioPlaying(false)
    }

    const startAudio = async () => {
      try {
        await fadeInAudio()
      } catch (error) {
        console.log('Audio autoplay blocked - will start on first interaction')
        const handleFirstClick = async () => {
          try {
            await fadeInAudio()
            document.removeEventListener('click', handleFirstClick)
          } catch (error) {
            console.error('Failed to play audio:', error)
            setAudioError('Failed to start audio playback')
          }
        }
        document.addEventListener('click', handleFirstClick)
      }
    }
    startAudio()

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
      ambientNoiseRef.current.pause()
      setIsAudioPlaying(false)
    }
  }, [])

  useEffect(() => {
    if (ambientNoiseRef.current && isAudioPlaying) {
      ambientNoiseRef.current.volume = (noise / 100) * (isMuted ? 0 : 1)
    }
  }, [isMuted])

  useEffect(() => {
    document.documentElement.style.filter = `brightness(${lighting}%)`
  }, [lighting])

  useEffect(() => {
    if (!isMuted && ambientNoiseRef.current) {
      ambientNoiseRef.current.volume = noise / 100
    }

    window.dispatchEvent(new CustomEvent('noiseLevel', {
      detail: { level: (noise / 100) * (isMuted ? 0 : 1) }
    }))
  }, [noise, isMuted])

  useEffect(() => {
    const isHot = temperature > 78
    const isCold = temperature < 68
    
    window.dispatchEvent(new CustomEvent('temperatureChange', {
      detail: { 
        temperature,
        isHot,
        isCold
      }
    }))

    document.documentElement.style.filter = `
      brightness(${lighting}%)
      ${isHot ? 'sepia(20%)' : ''}
      ${isCold ? 'hue-rotate(30deg)' : ''}
    `.trim()
  }, [temperature, lighting])

  const handleLightingChange = (e) => {
    const value = parseInt(e.target.value)
    setLighting(value)
    window.dispatchEvent(new CustomEvent('lightingChange', {
      detail: { level: value }
    }))
  }

  const handleNoiseChange = (e) => {
    const value = parseInt(e.target.value)
    setNoise(value)
  }

  const handleTemperatureChange = (e) => {
    const value = parseInt(e.target.value)
    setTemperature(value)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleEmergencyMode = () => {
    setIsEmergencyMode(!isEmergencyMode)
    if (!isEmergencyMode) {
      // Enter emergency mode
      setLighting(30)
      setNoise(85)
      setTemperature(78)
    } else {
      // Exit emergency mode
      setLighting(100)
      setNoise(50)
      setTemperature(72)
    }
  }

  return (
    <motion.div 
      className={`prison-card ${isEmergencyMode ? 'border-red-500' : ''}`}
      animate={{ 
        borderColor: isEmergencyMode ? ['#ef4444', '#831843', '#ef4444'] : '#374151',
      }}
      transition={{ 
        duration: 2, 
        repeat: isEmergencyMode ? Infinity : 0 
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2>Environment Controls</h2>
        <motion.button
          onClick={toggleEmergencyMode}
          className={`px-3 py-1 rounded text-sm ${
            isEmergencyMode 
              ? 'bg-red-900 text-red-100' 
              : 'bg-gray-700 text-gray-300'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isEmergencyMode ? '🚨 Exit Emergency Mode' : '🔒 Emergency Mode'}
        </motion.button>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium prison-text">
              Lighting ({lighting}%)
            </label>
            <motion.div 
              className="w-4 h-4 rounded-full bg-yellow-500"
              animate={{
                opacity: lighting / 100,
                boxShadow: `0 0 ${lighting / 4}px ${lighting / 8}px rgba(234, 179, 8, 0.5)`
              }}
            />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={lighting}
            onChange={handleLightingChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium prison-text">
              Ambient Noise ({noise}%)
            </label>
            <div className="flex items-center gap-2">
              {!isAudioPlaying && !audioError && (
                <span className="text-xs text-gray-400">
                  Click anywhere to start audio
                </span>
              )}
              {audioError && (
                <span className="text-xs text-red-400">
                  {audioError}
                </span>
              )}
              {isAudioPlaying && (
                <motion.button
                  onClick={toggleMute}
                  className="text-sm prison-text-secondary hover:text-gray-300 transition-colors flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMuted ? (
                    <span>🔇</span>
                  ) : (
                    <motion.div className="relative">
                      <motion.span
                        className="inline-block"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🔊
                      </motion.span>
                      <motion.div
                        className="absolute -right-1 -top-1"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      >
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-gray-400 rounded-full"
                            style={{
                              transform: `rotate(${i * 45}deg) translate(4px, 0)`
                            }}
                          />
                        ))}
                      </motion.div>
                    </motion.div>
                  )}
                </motion.button>
              )}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={noise}
            onChange={handleNoiseChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <motion.div 
            className="text-xs mt-1"
            animate={{
              color: noise > 75 ? '#fca5a5' : '#9ca3af'
            }}
          >
            {noise > 75 ? '⚠️ High noise levels may increase stress' :
             noise < 25 ? '🤫 Low ambient noise' :
             '👥 Normal ambient noise levels'}
          </motion.div>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium prison-text">
              Temperature ({temperature}°F)
            </label>
            <motion.div 
              className={`w-4 h-4 rounded-full ${
                temperature > 78 ? 'bg-red-500' :
                temperature < 68 ? 'bg-blue-500' :
                'bg-green-500'
              }`}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          <input
            type="range"
            min="65"
            max="85"
            value={temperature}
            onChange={handleTemperatureChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <motion.div 
            className="text-xs mt-1"
            animate={{
              color: temperature > 78 || temperature < 68 ? '#fca5a5' : '#9ca3af'
            }}
          >
            {temperature > 78 ? '🔥 High temperature may increase tension' :
             temperature < 68 ? '❄️ Low temperature may cause discomfort' :
             '✓ Temperature is in comfortable range'}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 