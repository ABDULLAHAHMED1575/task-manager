import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamAvatars } from "@/components/ui/avatar";
import {
  MoreVertical,
  Edit,
  Trash2,
  Users,
  CheckSquare,
  Calendar,
  Settings,
  UserPlus,
  Eye,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const TeamCard = ({
  team,
  onEdit,
  onDelete,
  onAddMember,
  onViewMembers,
  showActions = true,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString();
  };
  const getCompletionRate = () => {
    if (!team.total_tasks || team.total_tasks === 0) return 0;
    return Math.round((team.completed_tasks / team.total_tasks) * 100);
  };

  const getCompletionColor = () => {
    const rate = getCompletionRate();
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    if (rate >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card
      className={`hover:shadow-md transition-all duration-200 ${className}`}
      onMouseEnter={()=>setIsHovered(true)}
      onMouseLeave={()=>setIsHovered(false)}
    >
        <CardHeader className='pb-3'>
            <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
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
          
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewMembers?.(team)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(team)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Team
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddMember?.(team)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete?.(team.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="py-2">
        {team.members && team.members.length > 0 && (
          <div className="flex items-center gap-3 mb-3">
            <TeamAvatars members={team.members} />
            <span className="text-sm text-gray-500">
              {team.members.length > 3 
                ? `${team.members.slice(0, 3).map(m => m.username).join(', ')} +${team.members.length - 3} more`
                : team.members.map(m => m.username).join(', ')
              }
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <CheckSquare className="h-4 w-4" />
              <span className="font-semibold">{team.total_tasks || 0}</span>
            </div>
            <p className="text-xs text-gray-500">Total Tasks</p>
          </div>
          
          <div className="text-center">
            <div className={`flex items-center justify-center gap-1 ${getCompletionColor()}`}>
              <TrendingUp className="h-4 w-4" />
              <span className="font-semibold">{getCompletionRate()}%</span>
            </div>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
        </div>

        {team.total_tasks > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{team.completed_tasks || 0}/{team.total_tasks}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  getCompletionRate() >= 80 ? 'bg-green-500' :
                  getCompletionRate() >= 60 ? 'bg-yellow-500' :
                  getCompletionRate() >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${getCompletionRate()}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span className="hidden sm:inline">Created</span>
          <span>{formatDate(team.created_at)}</span>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {team.id && (
            <Link to={`/teams/${team.id}`} className="flex-1 sm:flex-none">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </Link>
          )}
          
          {isHovered && onAddMember && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onAddMember(team)}
              className="flex-1 sm:flex-none"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export default TeamCard;