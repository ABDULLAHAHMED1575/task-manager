import { cn } from '@/lib/utils'


const Loading = ({ size = 'md', text = 'Loading...', className }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-b-2 border-blue-600",
        sizes[size]
      )} />
      {text && (
        <p className="mt-2 text-gray-600 text-sm">{text}</p>
      )}
    </div>
  )
}
const LoadingScreen = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loading size="lg" text={text} />
    </div>
  )
}
const LoadingPage = ({ text = 'Loading page...' }) => {
  return (
    <div className="flex items-center justify-center py-20">
      <Loading size="lg" text={text} />
    </div>
  )
}
const LoadingButton = ({ isLoading, children, ...props }) => {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Loading size="sm" text="" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
      <div className="bg-gray-200 h-4 w-1/2 rounded mb-2"></div>
      <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
    </div>
  )
}
const TaskCardLoading = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="bg-gray-200 h-5 w-3/4 rounded"></div>
        <div className="bg-gray-200 h-6 w-16 rounded-full"></div>
      </div>
      <div className="bg-gray-200 h-4 w-full rounded mb-2"></div>
      <div className="bg-gray-200 h-4 w-2/3 rounded mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="bg-gray-200 h-6 w-20 rounded-full"></div>
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 h-6 w-6 rounded-full"></div>
          <div className="bg-gray-200 h-4 w-16 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export { 
  Loading, 
  LoadingScreen, 
  LoadingPage, 
  LoadingButton, 
  LoadingSkeleton,
  TaskCardLoading 
}