import { cn } from '@/lib/utils'

const Avatar = ({ children, className }) => {
  return (
    <div className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}>
      {children}
    </div>
  )
}

const AvatarFallback = ({ children, className }) => {
  return (
    <div className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 text-sm font-medium",
      className
    )}>
      {children}
    </div>
  )
}

const UserAvatar = ({ user, size = "md" }) => {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  const getInitials = (username) => {
    return username ? username.slice(0, 2).toUpperCase() : 'U'
  }

  return (
    <Avatar className={sizes[size]}>
      <AvatarFallback className={`bg-blue-100 text-blue-600 ${textSizes[size]}`}>
        {getInitials(user?.username)}
      </AvatarFallback>
    </Avatar>
  )
}

const TaskAvatar = ({ assignee }) => {
  const getInitials = (username) => {
    return username ? username.slice(0, 2).toUpperCase() : 'UN'
  }

  return (
    <Avatar className="h-6 w-6">
      <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
        {getInitials(assignee?.username)}
      </AvatarFallback>
    </Avatar>
  )
}

const TeamAvatars = ({ members }) => {
  const getInitials = (username) => {
    return username ? username.slice(0, 2).toUpperCase() : 'U'
  }

  return (
    <div className="flex -space-x-2">
      {members.slice(0, 3).map((member, index) => (
        <Avatar key={member.id || index} className="h-8 w-8 border-2 border-white">
          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">
            {getInitials(member.username)}
          </AvatarFallback>
        </Avatar>
      ))}
      {members.length > 3 && (
        <Avatar className="h-8 w-8 border-2 border-white">
          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
            +{members.length - 3}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

export { Avatar, AvatarFallback, UserAvatar, TaskAvatar, TeamAvatars }