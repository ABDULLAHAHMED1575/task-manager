import { cn } from '@/lib/utils'

const Card = ({ children, className }) => {
  return (
    <div className={cn(
      "rounded-lg border border-gray-200 bg-white shadow-sm",
      className
    )}>
      {children}
    </div>
  )
}

const CardHeader = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  )
}

const CardTitle = ({ children, className }) => {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  )
}

const CardDescription = ({ children, className }) => {
  return (
    <p className={cn("text-sm text-gray-600", className)}>
      {children}
    </p>
  )
}

const CardContent = ({ children, className }) => {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  )
}

const CardFooter = ({ children, className }) => {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }