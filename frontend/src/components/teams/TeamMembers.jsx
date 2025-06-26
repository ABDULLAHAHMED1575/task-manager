import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { UserAvatar } from '@/components/ui/avatar'
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  Crown,
  Calendar,
  Mail,
  X,
  AlertCircle,
  Trash2,
  UserCheck,
  Filter
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'

const TeamMembersManagement = ({ 
  team, 
  members = [], 
  onAddMember, 
  onRemoveMember, 
  currentUser,
  isLoading = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [filterRole, setFilterRole] = useState('all')
  const [showBulkActions, setShowBulkActions] = useState(false)
  const toast = useToast()

  const isCreator = members.length > 0 && members[0].id === currentUser?.id

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = filterRole === 'all' || 
      (filterRole === 'creator' && members.indexOf(member) === 0) ||
      (filterRole === 'member' && members.indexOf(member) !== 0)
    
    return matchesSearch && matchesRole
  })

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!newMemberEmail.trim()) return

    setIsSubmitting(true)
    try {
      await onAddMember(newMemberEmail.trim())
      setNewMemberEmail('')
      setShowAddForm(false)
      toast.success('Member added successfully!')
    } catch (error) {
      toast.error('Failed to add member: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from the team?`)) return

    try {
      await onRemoveMember(memberId)
      toast.success('Member removed successfully!')
      setSelectedMembers(prev => prev.filter(id => id !== memberId))
    } catch (error) {
      toast.error('Failed to remove member: ' + error.message)
    }
  }

  const handleBulkRemove = async () => {
    if (selectedMembers.length === 0) return
    
    const memberNames = selectedMembers
      .map(id => members.find(m => m.id === id)?.username)
      .filter(Boolean)
    
    if (!window.confirm(`Remove ${selectedMembers.length} members from the team?\n\n${memberNames.join(', ')}`)) {
      return
    }

    try {
      for (const memberId of selectedMembers) {
        await onRemoveMember(memberId)
      }
      setSelectedMembers([])
      setShowBulkActions(false)
      toast.success(`${selectedMembers.length} members removed successfully!`)
    } catch (error) {
      toast.error('Failed to remove some members')
    }
  }

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const selectAllMembers = () => {
    const selectableMembers = filteredMembers
      .filter((member, index) => index !== 0 && member.id !== currentUser?.id)
      .map(member => member.id)
    
    setSelectedMembers(prev => 
      prev.length === selectableMembers.length ? [] : selectableMembers
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString()
  }

  const canRemoveMember = (member, index) => {
    return isCreator && index !== 0 && member.id !== currentUser?.id
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-lg">Team Members</CardTitle>
                <p className="text-sm text-gray-600">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                  {selectedMembers.length > 0 && (
                    <span className="ml-2 text-blue-600">
                      ({selectedMembers.length} selected)
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isCreator && selectedMembers.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={handleBulkRemove}
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove ({selectedMembers.length})
                </Button>
              )}
              
              {isCreator && (
                <Button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search members by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    {filterRole === 'all' ? 'All' : filterRole === 'creator' ? 'Creator' : 'Members'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterRole('all')}>
                    All Members ({members.length})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole('creator')}>
                    Creator (1)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole('member')}>
                    Members ({members.length - 1})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isCreator && members.length > 3 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Select
                </Button>
              )}
            </div>
          </div>

          {showBulkActions && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedMembers.length > 0}
                  onCheckedChange={selectAllMembers}
                />
                <span className="text-sm font-medium text-blue-900">
                  Select all removable members
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowBulkActions(false)
                  setSelectedMembers([])
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {showAddForm && (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Add Member by Email
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Enter email address..."
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || !newMemberEmail.trim()}
                        size="sm"
                        className="shrink-0"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowAddForm(false)
                        setNewMemberEmail('')
                      }}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <div className="text-xs text-gray-500 flex items-center gap-1 sm:ml-auto">
                      <AlertCircle className="h-3 w-3" />
                      User must have an account to be added
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery || filterRole !== 'all' 
                ? 'No members found matching your criteria' 
                : 'No members in this team'
              }
            </p>
            {(searchQuery || filterRole !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setFilterRole('all')
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member, index) => (
              <div 
                key={member.id}
                className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                  selectedMembers.includes(member.id) 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {showBulkActions && canRemoveMember(member, index) && (
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={() => toggleMemberSelection(member.id)}
                  />
                )}

                <UserAvatar user={member} size="md" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-medium text-gray-900 truncate">
                      {member.username}
                    </h4>
                    
                    {index === 0 && (
                      <Badge variant="team" className="flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Creator
                      </Badge>
                    )}
                    {member.id === currentUser?.id && (
                      <Badge variant="secondary">You</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.joined_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>Joined {formatDate(member.joined_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canRemoveMember(member, index) && !showBulkActions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleRemoveMember(member.id, member.username)}
                          className="text-red-600"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove from team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Member Management Guidelines
          </h5>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Only team creators can add and remove members</p>
            <p>• Team creators cannot be removed from teams</p>
            <p>• Members can see all team tasks and collaborate</p>
            <p>• Use bulk actions to manage multiple members at once</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TeamMembersManagement