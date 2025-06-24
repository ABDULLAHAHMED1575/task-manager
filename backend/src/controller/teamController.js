const Team = require('../models/teams')
const Membership = require("../models/membership")
const { validationResult } = require('express-validator');

const createTeam = async (req,res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { name, description } = req.body;
        const creatorId = req.user.id;

        const team = await Team.create({ name, description }, creatorId);

        res.status(201).json({
            message: 'Team created successfully',
            team: team
        });
    }catch(error){
        console.error('Create team error:', error);
        
        if (error.message.includes('Team name already exists')) {
            return res.status(409).json({
                error: 'Team name already exists'
            });
        }

        res.status(500).json({
            error: 'Failed to create team'
        });
    }
}

const getUserTeams = async (req, res) => {
    try {
        const userId = req.user.id;
        const teams = await Team.findByUserId(userId);

        res.json({
            message: 'Teams retrieved successfully',
            teams: teams
        });

    } catch (error) {
        console.error('Get user teams error:', error);
        res.status(500).json({
            error: 'Failed to retrieve teams'
        });
    }
};

const getTeamById = async (req, res) => {
    try {
        const { teamId } = req.params;
        const team = await Team.findByIdWithStats(teamId);
        
        if (!team) {
            return res.status(404).json({
                error: 'Team not found'
            });
        }
        const members = await Team.getMembers(teamId);

        res.json({
            message: 'Team retrieved successfully',
            team: {
                ...team,
                members: members
            }
        });

    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({
            error: 'Failed to retrieve team'
        });
    }
};

const updateTeam = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { teamId } = req.params;
        const updates = req.body;

        const updatedTeam = await Team.update(teamId, updates);

        if (!updatedTeam) {
            return res.status(404).json({
                error: 'Team not found'
            });
        }

        res.json({
            message: 'Team updated successfully',
            team: updatedTeam
        });

    } catch (error) {
        console.error('Update team error:', error);
        
        if (error.message.includes('Team name already exists')) {
            return res.status(409).json({
                error: 'Team name already exists'
            });
        }

        res.status(500).json({
            error: 'Failed to update team'
        });
    }
};

const deleteTeam = async (req,res) => {
    try {
        const {teamId} = req.params;
        const userId = req.user.id;

        const members = await Team.getMembers(teamId);
        if (members.length === 0) {
            return res.status(404).json({
                error: 'Team not found'
            });
        }
        const creator = members[0];
        if (creator.id !== userId) {
            return res.status(403).json({
                error: 'Only team creator can delete team'
            });
        }

        const deleted = await Team.delete(teamId);

        if (!deleted) {
            return res.status(404).json({
                error: 'Team not found'
            });
        }

        res.json({
            message: 'Team deleted successfully'
        });
    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({
            error: 'Failed to delete team'
        });
    }
};

const addMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                error: 'User ID is required'
            });
        }

        const membership = await Team.addMember(teamId, userId);

        res.status(201).json({
            message: 'Member added successfully',
            membership: membership
        });

    } catch (error) {
        console.error('Add member error:', error);
        
        if (error.message.includes('already a member')) {
            return res.status(409).json({
                error: 'User is already a member of this team'
            });
        }

        if (error.message.includes('Invalid')) {
            return res.status(400).json({
                error: 'Invalid user or team ID'
            });
        }

        res.status(500).json({
            error: 'Failed to add member'
        });
    }
};

const removeMember = async (req, res) => {
    try {
        const { teamId, userId } = req.params;
        const currentUserId = req.user.id;
        const members = await Team.getMembers(teamId);
        if (members.length === 0) {
            return res.status(404).json({
                error: 'Team not found'
            });
        }

        const creator = members[0];
        if (parseInt(userId) === creator.id) {
            return res.status(400).json({
                error: 'Cannot remove team creator'
            });
        }
        if (currentUserId !== creator.id && currentUserId !== parseInt(userId)) {
            return res.status(403).json({
                error: 'Only team creator or the user themselves can remove membership'
            });
        }

        const removed = await Team.removeMember(teamId, userId);

        if (!removed) {
            return res.status(404).json({
                error: 'Membership not found'
            });
        }

        res.json({
            message: 'Member removed successfully'
        });

    } catch (error) {
        console.error('Remove member error:', error);
        
        if (error.message.includes('last member')) {
            return res.status(400).json({
                error: 'Cannot remove the last member from a team'
            });
        }

        res.status(500).json({
            error: 'Failed to remove member'
        });
    }
};

const getTeamMembers = async (req, res) => {
    try {
        const { teamId } = req.params;
        const members = await Team.getMembers(teamId);

        res.json({
            message: 'Members retrieved successfully',
            members: members
        });

    } catch (error) {
        console.error('Get team members error:', error);
        res.status(500).json({
            error: 'Failed to retrieve team members'
        });
    }
};

const getTeamTasks = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { status, assigned_to, search } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (assigned_to) filters.assigned_to = assigned_to;
        if (search) filters.search = search;

        const tasks = await Team.getTasks(teamId, filters);

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

const getTeamStatistics = async (req, res) => {
    try {
        const { teamId } = req.params;
        const stats = await Team.getStatistics(teamId);

        res.json({
            message: 'Team statistics retrieved successfully',
            statistics: stats
        });

    } catch (error) {
        console.error('Get team statistics error:', error);
        res.status(500).json({
            error: 'Failed to retrieve team statistics'
        });
    }
};

module.exports = {
    createTeam,
    getUserTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    getTeamMembers,
    getTeamTasks,
    getTeamStatistics
};