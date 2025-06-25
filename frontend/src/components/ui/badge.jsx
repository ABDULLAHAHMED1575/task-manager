import { cn } from '@/lib/utils'

const Badge = ({ children, variant = "default", className }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    urgent: "bg-red-100 text-red-800",
    team: "bg-blue-100 text-blue-800",
    member: "bg-purple-100 text-purple-800"
  }

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

const StatusBadge = ({ status }) => {
  const variant = status === 'COMPLETED' ? 'completed' : 'pending'
  return (
    <Badge variant={variant}>
      {status}
    </Badge>
  )
}

const TeamBadge = ({ teamName }) => {
  return (
    <Badge variant="team">
      {teamName}
    </Badge>
  )
}

const MemberCountBadge = ({ count }) => {
  return (
    <Badge variant="member">
      {count} members
    </Badge>
  )
}

export { Badge, StatusBadge, TeamBadge, MemberCountBadge }