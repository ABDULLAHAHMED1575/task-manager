import { useState, useRef, useEffect, cloneElement, Children } from 'react'
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

  const toggleOpen = () => setIsOpen(!isOpen)

  return (
    <div className="relative" ref={dropdownRef}>
      {Children.map(children, (child, index) => {
        if (!child) return null
        
        if (child.type === DropdownMenuTrigger) {
          return cloneElement(child, {
            key: index,
            onClick: toggleOpen,
            isOpen
          })
        }
        if (child.type === DropdownMenuContent) {
          return isOpen ? cloneElement(child, { 
            key: index,
            onItemClick: () => setIsOpen(false)
          }) : null
        }
        return child
      })}
    </div>
  )
}

const DropdownMenuTrigger = ({ children, onClick, asChild, isOpen, ...props }) => {
  const { isOpen: _, ...domProps } = props
  
  if (asChild && children) {
    return cloneElement(children, {
      ...children.props,
      onClick: (e) => {
        onClick?.(e)
        children.props.onClick?.(e)
      }
    })
  }

  return (
    <div onClick={onClick} {...domProps}>
      {children}
    </div>
  )
}

const DropdownMenuContent = ({ children, className, align = 'start', onItemClick }) => {
  const alignClasses = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2'
  }

  return (
    <div className={cn(
      'absolute top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-in fade-in-0 zoom-in-95',
      alignClasses[align],
      className
    )}>
      <div className="py-1">
        {Children.map(children, (child, index) => {
          if (child?.type === DropdownMenuItem) {
            return cloneElement(child, {
              key: index,
              onClick: (e) => {
                child.props.onClick?.(e)
                onItemClick?.()
              }
            })
          }
          return child
        })}
      </div>
    </div>
  )
}

const DropdownMenuItem = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors',
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