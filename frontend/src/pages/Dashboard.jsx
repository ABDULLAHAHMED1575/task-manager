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
    myTasks: 0,
    myCompletedTasks: 0,
    myPendingTasks: 0,
    totalTeams: 0,
    totalTeamTasks: 0,
    totalTeamCompletedTasks: 0
  })
  const [recentTasks, setRecentTasks] = useState([])
  const [teams, setTeams] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const teamsResponse = await teamService.getUserTeams()
      const userTeams = teamsResponse.teams || []
      
      const teamsWithStats = await Promise.all(
        userTeams.map(async (team) => {
          try {
            const teamDetails = await teamService.getTeamById(team.id)
            return {
              ...team,
              member_count: teamDetails.team?.member_count || 0,
              total_tasks: teamDetails.team?.total_tasks || 0,
              completed_tasks: teamDetails.team?.completed_tasks || 0,
              pending_tasks: teamDetails.team?.pending_tasks || 0
            }
          } catch (error) {
            return {
              ...team,
              member_count: 0,
              total_tasks: 0,
              completed_tasks: 0,
              pending_tasks: 0
            }
          }
        })
      )
      
      setTeams(teamsWithStats)

      const myTasksResponse = await taskService.getMyTasks()
      const myTasks = myTasksResponse.tasks || []
      setRecentTasks(myTasks.slice(0, 5))

      const totalTeamTasks = teamsWithStats.reduce((sum, team) => sum + (team.total_tasks || 0), 0)
      const totalTeamCompletedTasks = teamsWithStats.reduce((sum, team) => sum + (team.completed_tasks || 0), 0)

      setStats({
        myTasks: myTasks.length,
        myCompletedTasks: myTasks.filter(task => task.status === 'COMPLETED').length,
        myPendingTasks: myTasks.filter(task => task.status === 'PENDING').length,
        totalTeams: teamsWithStats.length,
        totalTeamTasks,
        totalTeamCompletedTasks
      })

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingPage text="Loading dashboard..." />
  }

  const myCompletionRate = stats.myTasks > 0 ? Math.round((stats.myCompletedTasks / stats.myTasks) * 100) : 0
  const teamCompletionRate = stats.totalTeamTasks > 0 ? Math.round((stats.totalTeamCompletedTasks / stats.totalTeamTasks) * 100) : 0

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
              My Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myTasks}</div>
            <p className="text-xs text-gray-500">
              Tasks assigned to me
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              My Completed
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.myCompletedTasks}</div>
            <p className="text-xs text-gray-500">
              {myCompletionRate}% of my tasks done
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              My Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.myPendingTasks}</div>
            <p className="text-xs text-gray-500">
              Need my attention
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

      {stats.totalTeamTasks > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalTeamTasks}</div>
                <p className="text-sm text-gray-600">Total Team Tasks</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalTeamCompletedTasks}</div>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{teamCompletionRate}%</div>
                <p className="text-sm text-gray-600">Team Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">My Recent Tasks</CardTitle>
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
                  <p className="text-gray-500 mb-4">No tasks assigned to you yet</p>
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
              <CardTitle className="text-lg font-semibold">My Teams</CardTitle>
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