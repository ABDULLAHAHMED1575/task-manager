import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Search, Plus, User, LogOut, Users, CheckSquare, Menu, X, ChevronRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import useAuth from '@/hooks/useAuth'

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleCreateTask = () => {
    navigate('/tasks?create=true')
  }

  const isActivePage = (path) => {
    if (path === '/teams' && location.pathname.startsWith('/teams')) {
      return true
    }
    return location.pathname === path
  }

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = []

    if (pathSegments.length === 0 || pathSegments[0] === 'dashboard') {
      return [{ label: 'Dashboard', path: '/dashboard', icon: Home }]
    }

    breadcrumbs.push({ label: 'Dashboard', path: '/dashboard', icon: Home })

    if (pathSegments[0] === 'teams') {
      breadcrumbs.push({ label: 'Teams', path: '/teams', icon: Users })
      
      if (pathSegments[1] && pathSegments[1] !== '') {
        breadcrumbs.push({ 
          label: `Team Details`, 
          path: `/teams/${pathSegments[1]}`,
          icon: Users,
          isActive: true 
        })
      }
    } else if (pathSegments[0] === 'tasks') {
      breadcrumbs.push({ label: 'Tasks', path: '/tasks', icon: CheckSquare, isActive: true })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/teams', label: 'Teams', icon: Users },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare }
  ]

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center">
              <CheckSquare className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TaskManager</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActivePage(item.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </form>

            <Button onClick={handleCreateTask} size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <UserAvatar user={user} size="md" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <UserAvatar user={user} size="sm" />
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {breadcrumbs.length > 1 && (
          <div className="flex items-center space-x-1 py-2 text-sm text-gray-500 overflow-x-auto">
            {breadcrumbs.map((crumb, index) => {
              const Icon = crumb.icon
              const isLast = index === breadcrumbs.length - 1
              
              return (
                <div key={crumb.path} className="flex items-center space-x-1 shrink-0">
                  {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                  <Link
                    to={crumb.path}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                      isLast || crumb.isActive
                        ? 'text-blue-600 bg-blue-50' 
                        : 'hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{crumb.label}</span>
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            <form onSubmit={handleSearch} className="px-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </form>
            
            <nav className="px-2 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActivePage(item.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            
            <div className="px-2">
              <Button 
                onClick={() => {
                  handleCreateTask()
                  setIsMobileMenuOpen(false)
                }} 
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header