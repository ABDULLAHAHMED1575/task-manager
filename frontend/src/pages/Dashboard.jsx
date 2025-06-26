import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingPage } from '@/components/ui/loading'
import { UserAvatar } from '@/components/ui/avatar'
import { 
  CheckSquare, 
  Users, 
  Clock, 
  Plus, 
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import { teamService } from '@/services/teamService'
import { taskService } from '@/services/taskService'
import { useToast } from '@/components/ui/toast'


const Dashboard = () => {
  const toast = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalTeams: 0
  })
  const [recentTasks, setRecentTasks] = useState([])
  const [teams, setTeams] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const [teamsData, tasksData] = await Promise.all([
        teamService.getUserTeams(),
        taskService.getMyTasks()
      ])
      setTeams(teamsData.teams || [])
      console.log('Task Data: ', tasksData);
      const tasks = tasksData.tasks || []
      setRecentTasks(tasks.slice(0, 5))

      setStats({
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.status === 'COMPLETED').length,
        pendingTasks: tasks.filter(task => task.status === 'PENDING').length,
        totalTeams: teamsData.teams?.length || 0
      })
      console.log('Stats: ',stats.totalTasks);
    } catch (error) {
      toast.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingPage text="Loading dashboard..." />
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-gray-600">
                Here's what's happening with your tasks today.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/tasks?create=true">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-gray-500">
              Across all teams
            </p>
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
            <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            <p className="text-xs text-gray-500">
              {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% completion rate
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
            <div className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</div>
            <p className="text-xs text-gray-500">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Teams
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalTeams}</div>
            <p className="text-xs text-gray-500">
              Active teams
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Tasks</CardTitle>
              <Link to="/tasks">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No tasks yet</p>
                  <Link to="/tasks?create=true">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Task
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600 truncate">
                          {task.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={task.status === 'COMPLETED' ? 'completed' : 'pending'}>
                            {task.status}
                          </Badge>
                          {task.team_name && (
                            <Badge variant="team">{task.team_name}</Badge>
                          )}
                        </div>
                      </div>
                      {task.assigned_to_username && (
                        <div className="ml-4">
                          <UserAvatar 
                            user={{ username: task.assigned_to_username }} 
                            size="sm" 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Your Teams</CardTitle>
              <Link to="/teams">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No teams yet</p>
                  <Link to="/teams?create=true">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Team
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {teams.slice(0, 4).map((team) => (
                    <div 
                      key={team.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{team.name}</h4>
                        <Badge variant="member">
                          {team.member_count || 0} members
                        </Badge>
                      </div>
                      {team.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {team.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {team.total_tasks || 0} tasks
                        </span>
                        <Link to={`/teams/${team.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard