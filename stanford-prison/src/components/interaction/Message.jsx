import { portraitPaths } from '../../utils/portraitPaths'

export default function Message({ role, content, timestamp }) {
  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'narrator':
        return 'text-blue-600'
      case 'guard':
        return 'text-red-600'
      case 'prisoner':
        return 'text-gray-600'
      case 'psychologist':
        return 'text-green-600'
      default:
        return 'text-gray-900'
    }
  }

  const paths = portraitPaths[role.toLowerCase()]

  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-700">
          <svg className="w-full h-full text-gray-600" viewBox="0 0 100 100">
            {/* Base face */}
            <path
              d={paths.face}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Features */}
            <path
              d={paths.features}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Additional elements (hat, glasses, etc) */}
            {paths.hat && (
              <path
                d={paths.hat}
                fill="currentColor"
              />
            )}
            {paths.glasses && (
              <path
                d={paths.glasses}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            )}
            {paths.head && (
              <path
                d={paths.head}
                fill="currentColor"
              />
            )}
            {paths.notepad && (
              <path
                d={paths.notepad}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            )}
            {paths.hair && (
              <path
                d={paths.hair}
                fill="currentColor"
              />
            )}
          </svg>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={`font-medium capitalize ${getRoleColor(role)}`}>
            {role === 'narrator' ? 'Dr. Zimbardo' : role}
          </span>
          <span className="text-sm prison-text-secondary">{timestamp}</span>
        </div>
        <p className="mt-1 prison-text">{content}</p>
      </div>
    </div>
  )
}