import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const Checkbox = ({ checked, onCheckedChange, disabled, className, id }) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-blue-600 border-blue-600 text-white" : "bg-white",
        className
      )}
      id={id}
    >
      {checked && (
        <Check className="h-3 w-3" strokeWidth={3} />
      )}
    </button>
  )
}

const TaskCheckbox = ({ task, onToggle }) => {
  const isCompleted = task.status === 'COMPLETED'
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onToggle(task.id, !isCompleted)}
      />
      <label className={cn(
        "text-sm font-medium cursor-pointer",
        isCompleted && "line-through text-gray-500"
      )}>
        {task.title}
      </label>
    </div>
  )
}

const CheckboxWithLabel = ({ checked, onCheckedChange, label, disabled }) => {
  const id = `checkbox-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <label 
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        {label}
      </label>
    </div>
  )
}

export { Checkbox, TaskCheckbox, CheckboxWithLabel }