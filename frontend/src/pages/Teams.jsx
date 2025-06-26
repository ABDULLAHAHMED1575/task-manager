import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingPage } from '@/components/ui/loading'
import TeamModal from '@/components/teams/TeamModal'
import TeamMembersManagement from '@/components/teams/TeamMembers'
import { 
  Plus, 
  Search, 
  Users, 
  CheckSquare,
  TrendingUp,
  RefreshCw,
  Grid,
  List,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  ArrowRight
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { teamService } from '@/services/teamService'
import { useToast } from '@/components/ui/toast'
import useAuth from '@/hooks/useAuth'

const Teams = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [showMembers, setShowMembers] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const shouldOpenCreate = searchParams.get('create') === 'true'

  useEffect(() => {
    loadTeams()
  }, [])

  useEffect(() => {
    if (shouldOpenCreate) {
      handleCreateTeam()
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('create')
      setSearchParams(newParams)
    }
  }, [shouldOpenCreate, searchParams, setSearchParams])

  const loadTeams = async () => {
    try {
      setLoading(true)
      const response = await teamService.getUserTeams()
      
      const teamsWithStats = await Promise.all(
        (response.teams || []).map(async (team) => {
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
            console.error(`Failed to load stats for team ${team.id}:`, error)
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
    } catch (error) {
      console.error('Failed to load teams:', error)
      toast.error('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadTeams()
      toast.success('Teams refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh teams')
    } finally {
      setRefreshing(false)
    }
  }

  const handleCreateTeam = () => {
    setEditingTeam(null)
    setIsModalOpen(true)
  }

  const handleEditTeam = (team) => {
    setEditingTeam(team)
    setIsModalOpen(true)
  }

  const handleSaveTeam = async (teamData) => {
    try {
      setIsCreating(true)
      
      if (editingTeam) {
        const response = await teamService.updateTeam(editingTeam.id, teamData)
        setTeams(prev =>
          prev.map(team =>
            team.id === editingTeam.id ? { ...team, ...response.team } : team
          )
        )
        toast.success('Team updated successfully!')
      } else {
        const response = await teamService.createTeam(teamData)
        const newTeam = {
          ...response.team,
          member_count: 1,
          total_tasks: 0,
          completed_tasks: 0,
          pending_tasks: 0
        }
        
        setTeams(prev => [newTeam, ...prev])
        toast.success('Team created successfully!')
        
        setTimeout(() => {
          navigate(`/teams/${response.team.id}`)
        }, 1000)
      }
      
      setIsModalOpen(false)
      setEditingTeam(null)
    } catch (error) {
      console.error('Failed to save team:', error)
      toast.error('Failed to save team')
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return
    }

    try {
      await teamService.deleteTeam(teamId)
      setTeams(prev => prev.filter(team => team.id !== teamId))
      toast.success('Team deleted successfully!')
    } catch (error) {
      console.error('Failed to delete team:', error)
      toast.error('Failed to delete team')
    }
  }

  const handleViewMembers = async (team) => {
    try {
      const response = await teamService.getTeamById(team.id)
      setSelectedTeam(response.team)
      setShowMembers(true)
    } catch (error) {
      console.error('Failed to load team details:', error)
      toast.error('Failed to load team details')
    }
  }

  const handleViewTeam = (teamId) => {
    navigate(`/teams/${teamId}`)
  }

  const handleAddMember = async (email) => {
    if (!selectedTeam) return

    try {
      await teamService.addMember(selectedTeam.id, { email })
      
      const response = await teamService.getTeamById(selectedTeam.id)
      setSelectedTeam(response.team)
      
      setTeams(prev =>
        prev.map(team =>
          team.id === selectedTeam.id 
            ? { ...team, member_count: response.team.member_count }
            : team
        )
      )
      
      toast.success('Member added successfully!')
    } catch (error) {
      console.error('Failed to add member:', error)
      toast.error(error.message || 'Failed to add member')
      throw error
    }
  }

  const handleRemoveMember = async (memberId) => {
    try {
      await teamService.removeMember(selectedTeam.id, memberId)
      const response = await teamService.getTeamById(selectedTeam.id)
      setSelectedTeam(response.team)
      setTeams(prev =>
        prev.map(team =>
          team.id === selectedTeam.id ? { ...team, member_count: response.team.member_count } : team
        )
      )
      toast.success('Member removed successfully!')
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error('Failed to remove member')
      throw error
    }
  }

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString()
  }

  const getCompletionRate = (team) => {
    if (!team.total_tasks || team.total_tasks === 0) return 0
    return Math.round((team.completed_tasks / team.total_tasks) * 100)
  }

  const totalMembers = teams.reduce((sum, team) => sum + (team.member_count || 0), 0)
  const totalTasks = teams.reduce((sum, team) => sum + (team.total_tasks || 0), 0)

  if (loading) {
    return <LoadingPage text="Loading teams..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600">
            Create and manage your teams, add members, and track progress
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
          <Button onClick={handleCreateTeam} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Team
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Teams
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-gray-500">
              {teams.length === 0 ? 'Create your first team' : 'Active teams'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Members
            </CardTitle>
            <UserPlus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalMembers}</div>
            <p className="text-xs text-gray-500">
              Across all teams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalTasks}</div>
            <p className="text-xs text-gray-500">
              Active tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {teams.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex border border-gray-200 rounded-md">
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
      )}

      {filteredTeams.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No teams found' : 'No teams yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? 'Try adjusting your search query' 
              : 'Create your first team to get started with collaboration'
            }
          </p>
          {!searchQuery && (
            <div className="space-y-4">
              <Button onClick={handleCreateTeam} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Team
              </Button>
              <div className="text-sm text-gray-500">
                <p>Teams help you organize work and collaborate with others</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-all duration-200 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {team.name}
                      </h3>
                      {team.member_count > 0 && (
                        <Badge variant="member">
                          {team.member_count} {team.member_count === 1 ? 'member' : 'members'}
                        </Badge>
                      )}
                    </div>
                    
                    {team.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {team.description}
                      </p>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewTeam(team.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewMembers(team)}>
                        <Users className="mr-2 h-4 w-4" />
                        View Members
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditTeam(team)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="py-2">
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-600">
                      <CheckSquare className="h-4 w-4" />
                      <span className="font-semibold">{team.total_tasks || 0}</span>
                    </div>
                    <p className="text-xs text-gray-500">Total Tasks</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-semibold">{getCompletionRate(team)}%</span>
                    </div>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Created {formatDate(team.created_at)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewTeam(team.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TeamModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTeam(null)
        }}
        onSave={handleSaveTeam}
        team={editingTeam}
        isSubmitting={isCreating}
      />

      {showMembers && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedTeam.name} - Members
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowMembers(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-6">
              <TeamMembersManagement
                team={selectedTeam}
                members={selectedTeam.members || []}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
                currentUser={user}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Teams