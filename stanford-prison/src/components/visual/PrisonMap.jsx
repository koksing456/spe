import { motion } from 'framer-motion'
import { useState } from 'react'

export default function PrisonMap() {
  const [selectedArea, setSelectedArea] = useState(null)

  const areas = {
    cells: 'Prisoner Cells - Six small cells housing three prisoners each',
    guardStation: 'Guard Station - Primary monitoring and control point',
    commonArea: 'Common Area - Space for controlled prisoner activities',
    observation: 'Observation Room - Research team monitoring area',
    entrance: 'Main Entrance - Controlled access point',
    corridor: 'Main Corridor - Primary movement pathway'
  }

  const handleAreaClick = (area) => {
    setSelectedArea(selectedArea === area ? null : area)
  }

  const handleMapClick = (e) => {
    // Only dismiss if clicking the map background, not the areas
    if (e.target.tagName === 'svg' || e.target.tagName === 'div') {
      setSelectedArea(null)
    }
  }

  return (
    <div className="prison-card mb-6">
      <h2>Prison Layout</h2>
      <div className="aspect-square bg-gray-800 rounded-lg p-4">
        <div 
          className="relative h-full border-2 border-gray-700 rounded-lg"
          onClick={handleMapClick}
        >
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* Main Prison Outline */}
            <rect x="20" y="20" width="160" height="160" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600" />

            {/* Cells (Top Row) */}
            <motion.g
              className="cursor-pointer text-gray-500 hover:text-purple-500"
              onClick={() => handleAreaClick('cells')}
              whileHover={{ scale: 1.05 }}
            >
              <rect x="30" y="30" width="30" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="70" y="30" width="30" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="110" y="30" width="30" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
            </motion.g>

            {/* Cells (Bottom Row) */}
            <motion.g
              className="cursor-pointer text-gray-500 hover:text-purple-500"
              onClick={() => handleAreaClick('cells')}
              whileHover={{ scale: 1.05 }}
            >
              <rect x="30" y="150" width="30" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="70" y="150" width="30" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="110" y="150" width="30" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
            </motion.g>

            {/* Guard Station */}
            <motion.g
              className="cursor-pointer text-gray-500 hover:text-red-500"
              onClick={() => handleAreaClick('guardStation')}
              whileHover={{ scale: 1.05 }}
            >
              <rect x="150" y="30" width="20" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="160" cy="50" r="5" fill="currentColor" />
            </motion.g>

            {/* Common Area */}
            <motion.g
              className="cursor-pointer text-gray-500 hover:text-blue-500"
              onClick={() => handleAreaClick('commonArea')}
              whileHover={{ scale: 1.05 }}
            >
              <rect x="60" y="70" width="80" height="60" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="100" cy="100" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
            </motion.g>

            {/* Observation Room */}
            <motion.g
              className="cursor-pointer text-gray-500 hover:text-green-500"
              onClick={() => handleAreaClick('observation')}
              whileHover={{ scale: 1.05 }}
            >
              <rect x="150" y="130" width="20" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M155 150 L165 150 M160 145 L160 155" stroke="currentColor" strokeWidth="2" />
            </motion.g>

            {/* Main Entrance */}
            <motion.g
              className="cursor-pointer text-gray-500 hover:text-yellow-500"
              onClick={() => handleAreaClick('entrance')}
              whileHover={{ scale: 1.05 }}
            >
              <rect x="20" y="90" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M25 100 L35 100" stroke="currentColor" strokeWidth="2" />
            </motion.g>

            {/* Corridors */}
            <motion.g
              className="cursor-pointer text-gray-500 hover:text-gray-400"
              onClick={() => handleAreaClick('corridor')}
              whileHover={{ opacity: 0.8 }}
            >
              <path d="M40 60 L40 140" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <path d="M150 60 L150 140" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </motion.g>
          </svg>

          {/* Area Description */}
          {selectedArea && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-0 left-0 right-0 p-2 bg-gray-900 bg-opacity-90 rounded-b-lg"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm prison-text flex-1 text-center">
                  {areas[selectedArea]}
                </p>
                <button
                  onClick={() => setSelectedArea(null)}
                  className="ml-2 text-gray-400 hover:text-gray-200 focus:outline-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
} 