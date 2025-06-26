import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingPage } from "@/components/ui/loading";
import { UserAvatar } from "@/components/ui/avatar";
import TeamModal from "@/components/teams/TeamModal";
import TeamMembersManagement from "@/components/teams/TeamMembers";
import TaskList from "@/components/tasks/TaskList";
import TaskModal from "@/components/tasks/TaskModal";
import {
  ArrowLeft,
  Edit,
  Settings,
  Users,
  CheckSquare,
  TrendingUp,
  Clock,
  Plus,
  Calendar,
  BarChart3,
} from "lucide-react";
import { teamService } from "@/services/teamService";
import { taskService } from "@/services/taskService";
import { useToast } from "@/components/ui/toast";
import useAuth from "@/hooks/useAuth";

const TeamDetailView = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [teamTasks, setTeamTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (teamId) {
      loadTeamData();
    }
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const [teamResponse, tasksResponse, membersResponse] = await Promise.all([
        teamService.getTeamById(teamId),
        taskService.getTasksByTeam(teamId),
        teamService.getTeamMembers(teamId),
      ]);

      setTeam({
        ...teamResponse.team,
        members: membersResponse.members || [],
      });
      setTeamTasks(tasksResponse.tasks || []);
    } catch (error) {
      toast.error("Failed to load team details");
      navigate("/teams");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async (teamData) => {
    try {
      const response = await teamService.updateTeam(teamId, teamData);
      setTeam((prev) => ({ ...prev, ...response.team }));
      setIsEditModalOpen(false);
      toast.success("Team updated successfully!");
    } catch (error) {
      throw error;
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const updatedTask = await taskService.updateTask(
          editingTask.id,
          taskData
        );
        setTeamTasks((prev) =>
          prev.map((task) =>
            task.id === editingTask.id ? { ...task, ...updatedTask.task } : task
          )
        );
        toast.success("Task updated successfully!");
      } else {
        const newTask = await taskService.createTask({
          ...taskData,
          team_id: teamId,
        });
        setTeamTasks((prev) => [newTask.task, ...prev]);
        toast.success("Task created successfully!");
      }

      setIsTaskModalOpen(false);
      setEditingTask(null);
      await loadTeamData();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await taskService.deleteTask(taskId);
      setTeamTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully!");
      await loadTeamData();
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleToggleTaskStatus = async (taskId, newStatus) => {
    try {
      if (newStatus === "COMPLETED") {
        await taskService.completeTask(taskId);
      } else {
        await taskService.pendingTask(taskId);
      }

      setTeamTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      await loadTeamData();
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const handleAddMember = async (email) => {
    try {
      await teamService.addMember(teamId, { email });
      await loadTeamData();

      toast.success("Member added successfully!");
    } catch (error) {
      console.error("Failed to add member:", error);
      toast.error(error.message || "Failed to add member");
      throw error;
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await teamService.removeMember(teamId, memberId);

      await loadTeamData();

      toast.success("Member removed successfully!");
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error(error.message || "Failed to remove member");
      throw error;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString();
  };

  const getCompletionRate = () => {
    if (!team?.total_tasks || team.total_tasks === 0) return 0;
    return Math.round((team.completed_tasks / team.total_tasks) * 100);
  };

  const isCreator =
    team?.members && team.members.length > 0 && team.members[0].id === user?.id;

  if (loading) {
    return <LoadingPage text="Loading team details..." />;
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Team not found
        </h2>
        <p className="text-gray-600 mb-4">
          The team you're looking for doesn't exist or you don't have access to
          it.
        </p>
        <Link to="/teams">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/teams">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-gray-600">
              {team.description || "No description provided"}
            </p>
          </div>
        </div>

        {isCreator && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsEditModalOpen(true)}
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Team
            </Button>
            <Button onClick={handleCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Members
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.member_count || 0}</div>
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
            <div className="text-2xl font-bold">{team.total_tasks || 0}</div>
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
            <div className="text-2xl font-bold text-green-600">
              {team.completed_tasks || 0}
            </div>
            <p className="text-xs text-gray-500">
              {getCompletionRate()}% completion rate
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
            <div className="text-2xl font-bold text-orange-600">
              {team.pending_tasks || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {team.total_tasks > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Team Progress
              </span>
              <span className="text-sm text-gray-500">
                {team.completed_tasks || 0} of {team.total_tasks} tasks
                completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-green-500"
                style={{ width: `${getCompletionRate()}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {["overview", "tasks", "members"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Team Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Team Name
                </label>
                <p className="text-gray-900">{team.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="text-gray-900">
                  {team.description || "No description provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Created
                </label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(team.created_at)}
                </p>
              </div>
              {team.members && team.members.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Creator
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <UserAvatar user={team.members[0]} size="sm" />
                    <span className="text-gray-900">
                      {team.members[0].username}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No tasks created yet
                </p>
              ) : (
                <div className="space-y-3">
                  {teamTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {task.assigned_to_username || "Unassigned"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          task.status === "COMPLETED" ? "completed" : "pending"
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                  {teamTasks.length > 5 && (
                    <button
                      onClick={() => setActiveTab("tasks")}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View all {teamTasks.length} tasks
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "tasks" && (
        <TaskList
          tasks={teamTasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggleStatus={handleToggleTaskStatus}
          onAssign={handleEditTask}
          onCreateTask={handleCreateTask}
          showTeamNames={false}
          emptyMessage="No tasks in this team yet. Create your first task to get started!"
        />
      )}

      {activeTab === "members" && (
        <TeamMembersManagement
          team={team}
          members={team.members || []}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          currentUser={user}
        />
      )}

      <TeamModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateTeam}
        team={team}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        teams={[team]}
      />
    </div>
  );
};

export default TeamDetailView;
