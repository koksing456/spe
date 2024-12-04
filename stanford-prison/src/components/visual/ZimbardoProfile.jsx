import { motion } from 'framer-motion'

export default function ZimbardoProfile() {
  return (
    <div className="prison-card mb-6">
      <h2>Principal Investigator</h2>
      <div className="flex items-center space-x-4 mt-4">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-700">
            <svg className="w-full h-full text-gray-600" viewBox="0 0 100 100">
              {/* Sketch-style portrait */}
              <path
                d="M50 20 C60 20, 70 30, 70 40 C70 50, 65 55, 65 60 C65 65, 60 70, 50 70 C40 70, 35 65, 35 60 C35 55, 30 50, 30 40 C30 30, 40 20, 50 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Face features */}
              <path
                d="M40 45 C42 45, 44 46, 45 48 M55 45 C53 45, 51 46, 50 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M45 55 C47 58, 53 58, 55 55"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Hair */}
              <path
                d="M30 40 C30 30, 40 20, 50 20 C60 20, 70 30, 70 40 C70 35, 65 25, 50 25 C35 25, 30 35, 30 40"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold prison-text">Dr. Philip Zimbardo</h3>
          <p className="prison-text-secondary">Stanford University</p>
          <p className="mt-2 text-sm prison-text">Principal investigator of the Stanford Prison Experiment, studying the psychological effects of perceived power and authority.</p>
        </div>
      </div>
    </div>
  )
} 