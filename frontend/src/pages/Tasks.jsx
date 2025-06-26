import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import TaskList from '@/components/tasks/TaskList'
import TaskModal from '@/components/tasks/TaskModal'
import { LoadingPage } from '@/components/ui/loading'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckSquare, 
  Plus, 
  RefreshCw, 
  TrendingUp,
  Clock,
  Users
} from 'lucide-react'
import { taskService } from '@/services/taskService'
import { teamService } from '@/services/teamService'

const Tasks = () => {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [tasks, setTasks] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const shouldOpenCreate = searchParams.get('create') === 'true'

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (shouldOpenCreate) {
      setIsModalOpen(true)
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('create')
      setSearchParams(newParams)
    }
  }, [shouldOpenCreate, searchParams, setSearchParams])

  const loadData = async () => {
    try {
      setLoading(true)
      const [tasksData, teamsData] = await Promise.all([
        taskService.getAllTasks(),
        teamService.getUserTeams()
      ])
      
      setTasks(tasksData.tasks || [])
      setTeams(teamsData.teams || [])
    } catch (error) {
      console.error('Failed to load tasks:', error)
      toast.error('Failed to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadData()
      toast.success('Tasks refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh tasks')
    } finally {
      setRefreshing(false)
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      await taskService.deleteTask(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
      toast.success('Task deleted successfully!')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task. Please try again.')
    }
  }

  const handleToggleStatus = async (taskId, newStatus) => {
    try {
      if (newStatus === 'COMPLETED') {
        await taskService.completeTask(taskId)
        toast.success('Task marked as completed!')
      } else {
        await taskService.pendingTask(taskId)
        toast.success('Task marked as pending!')
      }
      
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      )
    } catch (error) {
      console.error('Failed to update task status:', error)
      toast.error('Failed to update task status. Please try again.')
    }
  }

  const handleAssignTask = async (task) => {
    handleEditTask(task)
  }

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const updatedTask = await taskService.updateTask(editingTask.id, taskData)
        setTasks(prev =>
          prev.map(task =>
            task.id === editingTask.id ? { ...task, ...updatedTask.task } : task
          )
        )
        toast.success('Task updated successfully!')
      } else {
        const newTask = await taskService.createTask(taskData)
        setTasks(prev => [newTask.task, ...prev])
        toast.success('Task created successfully!')
      }
      
      setIsModalOpen(false)
      setEditingTask(null)
    } catch (error) {
      console.error('Failed to save task:', error)
      toast.error('Failed to save task. Please try again.')
      throw error
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'COMPLETED').length,
    pending: tasks.filter(task => task.status === 'PENDING').length,
    assigned: tasks.filter(task => task.assigned_to).length
  }

  if (loading) {
    return <LoadingPage text="Loading tasks..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">
            Manage and track your tasks across all teams
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completed
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-gray-500">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% done
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Assigned
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.assigned}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge 
          variant="secondary" 
          className="cursor-pointer hover:bg-blue-100"
          onClick={() => {
            const params = new URLSearchParams(searchParams)
            params.delete('filter')
            setSearchParams(params)
          }}
        >
          All Tasks ({stats.total})
        </Badge>
        <Badge 
          variant="pending" 
          className="cursor-pointer hover:bg-orange-100"
          onClick={() => {
            const params = new URLSearchParams(searchParams)
            params.set('filter', 'pending')
            setSearchParams(params)
          }}
        >
          Pending ({stats.pending})
        </Badge>
        <Badge 
          variant="completed" 
          className="cursor-pointer hover:bg-green-100"
          onClick={() => {
            const params = new URLSearchParams(searchParams)
            params.set('filter', 'completed')
            setSearchParams(params)
          }}
        >
          Completed ({stats.completed})
        </Badge>
      </div>

      <TaskList
        tasks={tasks}
        loading={loading}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onToggleStatus={handleToggleStatus}
        onAssign={handleAssignTask}
        onCreateTask={handleCreateTask}
        showTeamNames={true}
        emptyMessage={
          tasks.length === 0 
            ? "No tasks yet. Create your first task to get started!"
            : "No tasks match your filters"
        }
      />
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={editingTask}
        teams={teams}
        loading={loading}
      />
    </div>
  )
}

export default Tasks