import { useState } from 'react'
import TaskCard from './TaskCard'
import { TaskCardLoading } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Plus, 
  CheckSquare,
  SortAsc,
  SortDesc,
  Grid,
  List
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const TaskList = ({ 
  tasks = [], 
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onAssign,
  onCreateTask,
  showTeamNames = true,
  emptyMessage = "No tasks found",
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [viewMode, setViewMode] = useState('grid') 

  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter.toUpperCase()
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const getStatusCount = (status) => {
    if (status === 'all') return tasks.length
    return tasks.filter(task => task.status === status.toUpperCase()).length
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <TaskCardLoading key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Status
                  {statusFilter !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      {getStatusCount(statusFilter)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All ({getStatusCount('all')})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  Pending ({getStatusCount('pending')})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                  Completed ({getStatusCount('completed')})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4 mr-2" />
                  ) : (
                    <SortDesc className="h-4 w-4 mr-2" />
                  )}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {setSortBy('created_at'); setSortOrder('desc')}}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {setSortBy('created_at'); setSortOrder('asc')}}>
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {setSortBy('title'); setSortOrder('asc')}}>
                  Title A-Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {setSortBy('status'); setSortOrder('asc')}}>
                  Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex border border-gray-200 rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none border-l"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {onCreateTask && (
          <Button onClick={onCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge 
          variant={statusFilter === 'all' ? 'default' : 'secondary'}
          className="cursor-pointer"
          onClick={() => setStatusFilter('all')}
        >
          All ({getStatusCount('all')})
        </Badge>
        <Badge 
          variant={statusFilter === 'pending' ? 'pending' : 'secondary'}
          className="cursor-pointer"
          onClick={() => setStatusFilter('pending')}
        >
          Pending ({getStatusCount('pending')})
        </Badge>
        <Badge 
          variant={statusFilter === 'completed' ? 'completed' : 'secondary'}
          className="cursor-pointer"
          onClick={() => setStatusFilter('completed')}
        >
          Completed ({getStatusCount('completed')})
        </Badge>
      </div>
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
          {searchQuery || statusFilter !== 'all' ? (
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filters
            </p>
          ) : (
            <p className="text-gray-500 mb-4">
              Get started by creating your first task
            </p>
          )}
          {onCreateTask && (
            <Button onClick={onCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        }>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onAssign={onAssign}
              showTeam={showTeamNames}
              className={viewMode === 'list' ? 'w-full' : ''}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskList