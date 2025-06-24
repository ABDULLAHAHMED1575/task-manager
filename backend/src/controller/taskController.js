const Task = require('../models/task');
const Team = require('../models/teams');
const User = require('../models/user');
const Membership = require('../models/membership');
const { validationResult } = require('express-validator');

const createTask = async (req,res) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                error:'Validation failed',
                details: errors.array()
            });
        }
        const {title,description,team_id,assigned_to} = req.body;
        const userId = req.user.id;

        const isMember = await Membership.exists(userId,team_id);
        if(!isMember){
            return res.status(403).json({
                error: 'Access denied',
                message: 'You are not a member of this team'
            });
        }
        
        if(assigned_to){
            const isAssignedMember = await Membership.exists(assigned_to,team_id);
            if(!isAssignedMember){
                return res.status(400).json({
                    error: 'Assigned user is not a member of this team',
                })
            }
        }

        const task = await Task.create({
            title,
            description,
            team_id,
            assigned_to
        });

        res.status(201).json({
            message: 'Task created successfully',
            task: task
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({
            error: 'Failed to create task'
        });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, team_id, assigned_to, search } = req.query;

        let tasks;

        if (search) {
            tasks = await Task.search(search, team_id);
        } else if (status) {
            tasks = await Task.findByStatus(status, team_id);
        } else {
            tasks = await Task.findByUserTeams(userId);
        }
        if (assigned_to) {
            tasks = tasks.filter(task => task.assigned_to == assigned_to);
        }

        res.json({
            message: 'Tasks retrieved successfully',
            tasks: tasks
        });

    } catch (error) {
        console.error('Get all tasks error:', error);
        res.status(500).json({
            error: 'Failed to retrieve tasks'
        });
    }
};

const getMyTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, team_id } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (team_id) filters.team_id = team_id;

        const tasks = await User.getTask(userId, filters);

        res.json({
            message: 'Your tasks retrieved successfully',
            tasks: tasks
        });

    } catch (error) {
        console.error('Get my tasks error:', error);
        res.status(500).json({
            error: 'Failed to retrieve your tasks'
        });
    }
};

const searchTasks = async (req, res) => {
    try {
        const { q, team_id, status } = req.query;

        if (!q) {
            return res.status(400).json({
                error: 'Search query is required'
            });
        }

        let tasks = await Task.search(q, team_id);

        if (status) {
            tasks = tasks.filter(task => task.status === status);
        }

        res.json({
            message: 'Search results retrieved successfully',
            tasks: tasks,
            query: q
        });

    } catch (error) {
        console.error('Search tasks error:', error);
        res.status(500).json({
            error: 'Failed to search tasks'
        });
    }
};

const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.json({
            message: 'Task retrieved successfully',
            task: task
        });

    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({
            error: 'Failed to retrieve task'
        });
    }
};

const updateTask = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { taskId } = req.params;
        const updates = req.body;

        if (updates.assigned_to) {
            const task = await Task.findById(taskId);
            const isAssignedMember = await Membership.exists(updates.assigned_to, task.team_id);
            if (!isAssignedMember) {
                return res.status(400).json({
                    error: 'Assigned user is not a member of this team'
                });
            }
        }

        const updatedTask = await Task.update(taskId, updates);

        if (!updatedTask) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.json({
            message: 'Task updated successfully',
            task: updatedTask
        });

    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            error: 'Failed to update task'
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const deleted = await Task.delete(taskId);

        if (!deleted) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.json({
            message: 'Task deleted successfully'
        });

    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            error: 'Failed to delete task'
        });
    }
};

const assignTask = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { taskId } = req.params;
        const { user_id } = req.body;

        const task = await Task.findById(taskId);
        const isAssignedMember = await Membership.exists(user_id, task.team_id);
        if (!isAssignedMember) {
            return res.status(400).json({
                error: 'User is not a member of this team'
            });
        }

        const updatedTask = await Task.assign(taskId, user_id);

        res.json({
            message: 'Task assigned successfully',
            task: updatedTask
        });

    } catch (error) {
        console.error('Assign task error:', error);
        res.status(500).json({
            error: 'Failed to assign task'
        });
    }
};

const unassignTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const updatedTask = await Task.unassign(taskId);

        res.json({
            message: 'Task unassigned successfully',
            task: updatedTask
        });

    } catch (error) {
        console.error('Unassign task error:', error);
        res.status(500).json({
            error: 'Failed to unassign task'
        });
    }
};

const completeTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const updatedTask = await Task.markCompleted(taskId);

        res.json({
            message: 'Task marked as completed',
            task: updatedTask
        });

    } catch (error) {
        console.error('Complete task error:', error);
        res.status(500).json({
            error: 'Failed to complete task'
        });
    }
};

const pendingTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const updatedTask = await Task.markPending(taskId);

        res.json({
            message: 'Task marked as pending',
            task: updatedTask
        });

    } catch (error) {
        console.error('Pending task error:', error);
        res.status(500).json({
            error: 'Failed to mark task as pending'
        });
    }
};

const getTasksByTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { status, assigned_to } = req.query;

        let tasks = await Task.findByTeamId(teamId);
        if (status) {
            tasks = tasks.filter(task => task.status === status);
        }

        if (assigned_to) {
            tasks = tasks.filter(task => task.assigned_to == assigned_to);
        }

        res.json({
            message: 'Team tasks retrieved successfully',
            tasks: tasks
        });

    } catch (error) {
        console.error('Get team tasks error:', error);
        res.status(500).json({
            error: 'Failed to retrieve team tasks'
        });
    }
};

const getTasksByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        if (parseInt(userId) !== currentUserId) {
            const currentUserTeams = await User.getTeams(currentUserId);
            const targetUserTeams = await User.getTeams(userId);
            
            const sharedTeams = currentUserTeams.filter(team1 => 
                targetUserTeams.some(team2 => team1.id === team2.id)
            );

            if (sharedTeams.length === 0) {
                return res.status(403).json({
                    error: 'Access denied',
                    message: 'You can only view tasks of team members'
                });
            }
        }

        const tasks = await Task.findByAssignedUser(userId);

        res.json({
            message: 'User tasks retrieved successfully',
            tasks: tasks
        });

    } catch (error) {
        console.error('Get user tasks error:', error);
        res.status(500).json({
            error: 'Failed to retrieve user tasks'
        });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getMyTasks,
    searchTasks,
    getTaskById,
    updateTask,
    deleteTask,
    assignTask,
    unassignTask,
    completeTask,
    pendingTask,
    getTasksByTeam,
    getTasksByUser
};