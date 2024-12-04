import { useState } from 'react'

export default function EnvironmentControls() {
  const [lighting, setLighting] = useState(100)
  const [noise, setNoise] = useState(50)
  const [temperature, setTemperature] = useState(72)

  return (
    <div className="prison-card">
      <h2>Environment Controls</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium prison-text">
            Lighting ({lighting}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={lighting}
            onChange={(e) => setLighting(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium prison-text">
            Noise Level ({noise}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={noise}
            onChange={(e) => setNoise(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium prison-text">
            Temperature ({temperature}°F)
          </label>
          <input
            type="range"
            min="65"
            max="85"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
} 