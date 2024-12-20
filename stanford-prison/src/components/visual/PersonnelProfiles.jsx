import { motion } from 'framer-motion'

export default function PersonnelProfiles() {
  const personnel = [
    {
      role: 'Guard',
      title: 'Prison Guard',
      description: 'Enforcing rules and maintaining order within the facility.',
      color: '#EF4444', // Red
      svgPaths: {
        // Guard with cap and stern expression
        face: "M50 25 C60 25, 70 35, 70 45 C70 55, 65 60, 65 65 C65 70, 60 75, 50 75 C40 75, 35 70, 35 65 C35 60, 30 55, 30 45 C30 35, 40 25, 50 25",
        features: "M40 50 L45 50 M55 50 L60 50 M45 62 L55 62",
        hat: "M25 40 L75 40 L70 35 L30 35 L25 40 Z",
        badge: "M45 42 L55 42 L55 48 L50 50 L45 48 Z"
      }
    },
    {
      role: 'Prisoner',
      title: 'Inmate #8612',
      description: 'Subject to prison rules and routines under observation.',
      color: '#6B7280', // Gray
      svgPaths: {
        // Prisoner with shaved head and weary expression
        face: "M50 30 C60 30, 65 40, 65 50 C65 60, 60 65, 50 65 C40 65, 35 60, 35 50 C35 40, 40 30, 50 30",
        features: "M43 48 C44 46, 46 46, 47 48 M53 48 C54 46, 56 46, 57 48 M45 58 C47 56, 53 56, 55 58",
        head: "M35 35 C35 25, 65 25, 65 35 C65 40, 35 40, 35 35",
        number: "M40 70 L60 70"
      }
    },
    {
      role: 'Psychologist',
      title: 'Research Psychologist',
      description: 'Monitoring psychological effects and participant well-being.',
      color: '#8B5CF6', // Purple
      svgPaths: {
        // Professional with glasses and neat appearance
        face: "M50 25 C60 25, 70 35, 70 45 C70 55, 65 60, 65 65 C65 70, 60 75, 50 75 C40 75, 35 70, 35 65 C35 60, 30 55, 30 45 C30 35, 40 25, 50 25",
        features: "M40 50 L45 50 M55 50 L60 50 M45 60 C47 62, 53 62, 55 60",
        glasses: "M38 48 C40 48, 47 48, 49 48 M51 48 C53 48, 60 48, 62 48 M49 48 L51 48",
        hair: "M30 40 C30 30, 40 20, 50 20 C60 20, 70 30, 70 40 C70 35, 65 25, 50 25 C35 25, 30 35, 30 40"
      }
    },
    // {
    //   role: 'Observer',
    //   title: 'Research Observer',
    //   description: 'Documenting behaviors and interactions throughout the study.',
    //   color: '#10B981', // Green
    //   svgPaths: {
    //     // Observer with notepad and attentive expression
    //     face: "M50 25 C60 25, 70 35, 70 45 C70 55, 65 60, 65 65 C65 70, 60 75, 50 75 C40 75, 35 70, 35 65 C35 60, 30 55, 30 45 C30 35, 40 25, 50 25",
    //     features: "M43 50 C44 48, 46 48, 47 50 M53 50 C54 48, 56 48, 57 50 M45 58 C47 60, 53 60, 55 58",
    //     notepad: "M65 45 L75 45 L75 65 L65 65 Z M67 50 L73 50 M67 55 L73 55 M67 60 L73 60",
    //     glasses: "M38 48 C40 48, 47 48, 49 48 M51 48 C53 48, 60 48, 62 48 M49 48 L51 48"
    //   }
    // }
  ]

  return (
    <div className="prison-card">
      <h2>Personnel Profiles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {personnel.map((person, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="prison-card-content p-4 flex items-start space-x-4"
          >
            <div className="flex-shrink-0">
              <div 
                className="w-16 h-16 rounded-lg overflow-hidden border-2"
                style={{ borderColor: person.color }}
              >
                <svg 
                  className="w-full h-full" 
                  viewBox="0 0 100 100"
                  style={{ color: person.color }}
                >
                  {/* Base face */}
                  <path
                    d={person.svgPaths.face}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Features */}
                  <path
                    d={person.svgPaths.features}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Additional elements */}
                  {person.svgPaths.hat && (
                    <path
                      d={person.svgPaths.hat}
                      fill="currentColor"
                      opacity="0.9"
                    />
                  )}
                  {person.svgPaths.badge && (
                    <path
                      d={person.svgPaths.badge}
                      fill="currentColor"
                      opacity="0.9"
                    />
                  )}
                  {person.svgPaths.glasses && (
                    <path
                      d={person.svgPaths.glasses}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="0.9"
                    />
                  )}
                  {person.svgPaths.head && (
                    <path
                      d={person.svgPaths.head}
                      fill="currentColor"
                      opacity="0.3"
                    />
                  )}
                  {person.svgPaths.notepad && (
                    <path
                      d={person.svgPaths.notepad}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="0.9"
                    />
                  )}
                  {person.svgPaths.hair && (
                    <path
                      d={person.svgPaths.hair}
                      fill="currentColor"
                      opacity="0.3"
                    />
                  )}
                  {person.svgPaths.number && (
                    <path
                      d={person.svgPaths.number}
                      stroke="currentColor"
                      strokeWidth="1"
                      opacity="0.7"
                    />
                  )}
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold prison-text">{person.role}</h3>
              <p className="text-sm prison-text-secondary">{person.title}</p>
              <p className="mt-1 text-xs prison-text">{person.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 