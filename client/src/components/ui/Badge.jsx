import { statusColors } from '../../utils/formatters'

export const Badge = ({ status, children, className = '' }) => {
  const normalizedStatus = status?.toLowerCase()
  const colorClass = statusColors[normalizedStatus] || 'badge-slate'
  
  return (
    <span className={`badge ${colorClass} ${className}`}>
      {children || status}
    </span>
  )
}
