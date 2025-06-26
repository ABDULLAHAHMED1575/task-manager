import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "@/components/ui/avatar";
import {
  MoreVertical,
  Edit,
  Trash2,
  User,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  onAssign,
  showTeam = true,
  className,
}) => {
  const [isCompleted, setIsCompleted] = useState(task.status === "COMPLETED");
  const handleStatusToggle = async () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    await onToggleStatus?.(task.id, newStatus ? "COMPLETED" : "PENDING");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card
      className={`hover:shadow-md transition-all duration-200 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleStatusToggle}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <h3
                className={`font-medium text-gray-900 line-clamp-2 ${
                  isCompleted ? "line-through text-gray-500" : ""
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssign?.(task)}>
                <User className="mr-2 h-4 w-4" />
                Assign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(task.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="py-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isCompleted ? "completed" : "pending"}>
            {isCompleted ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </>
            )}
          </Badge>

          {showTeam && task.team_name && (
            <Badge variant="team">{task.team_name}</Badge>
          )}

          {task.priority && (
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assigned_to_username ? (
            <>
              <UserAvatar
                user={{ username: task.assigned_to_username }}
                size="sm"
              />
              <span className="text-sm text-gray-600 hidden sm:inline">
                {task.assigned_to_username}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-500">Unassigned</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className="hidden sm:inline">
                {formatDate(task.due_date)}
              </span>
            </div>
          )}
          {task.created_at && (
            <span className="hidden md:inline">
              Created {formatDate(task.created_at)}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
