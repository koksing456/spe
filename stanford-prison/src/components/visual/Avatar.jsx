export default function Avatar({ role }) {
  const getAvatarStyle = (role) => {
    const baseClasses = "h-10 w-10 rounded-full flex items-center justify-center text-white text-lg font-bold"
    
    switch (role.toLowerCase()) {
      case 'narrator':
        return `${baseClasses} bg-blue-600` // Dr. Zimbardo
      case 'guard':
        return `${baseClasses} bg-red-600` // Guard
      case 'prisoner':
        return `${baseClasses} bg-gray-600` // Prisoner
      case 'psychologist':
        return `${baseClasses} bg-green-600` // Psychologist
      default:
        return `${baseClasses} bg-gray-400`
    }
  }

  const getInitial = (role) => {
    switch (role.toLowerCase()) {
      case 'narrator':
        return 'Z' // Zimbardo
      case 'guard':
        return 'G'
      case 'prisoner':
        return 'P'
      case 'psychologist':
        return 'Ψ' // Psychology symbol
      default:
        return '?'
    }
  }

  return (
    <div className={getAvatarStyle(role)}>
      {getInitial(role)}
    </div>
  )
} 