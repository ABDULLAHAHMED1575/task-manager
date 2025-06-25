import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {children}
    </div>
  )
}

const DropdownMenuTrigger = ({ asChild, children, ...props }) => {
  const [, setIsOpen] = useState(false)
  
  return (
    <div onClick={() => setIsOpen(prev => !prev)} {...props}>
      {children}
    </div>
  )
}

const DropdownMenuContent = ({ children, className, align = 'start' }) => {
  const alignClasses = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2'
  }

  return (
    <div className={cn(
      'absolute top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50',
      alignClasses[align],
      className
    )}>
      <div className="py-1">
        {children}
      </div>
    </div>
  )
}

const DropdownMenuItem = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        className
      )}
    >
      {children}
    </button>
  )
}

const DropdownMenuSeparator = () => {
  return <hr className="my-1 border-gray-200" />
}

export { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
}