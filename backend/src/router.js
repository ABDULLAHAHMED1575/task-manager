const express = require('express');
const router = express.Router();
const authController = require('./controller/authController');
const teamController = require('./controller/teamController');
const taskController = require('./controller/taskController');
const validateUser = require('./validators/user/validateUser');
const validateTeam = require('./validators/team/validateTeam');
const validateTask = require('./validators/task/taskValidator');
const { requireAuth, requireTeamAccess, requireTaskAccess } = require('../middleware/authMiddleware');


router.post('/authRegister', validateUser.validateRegister, authController.register);
router.post('/login', validateUser.validateLogin, authController.login);
router.post('/logout', authController.logout);


router.post('/tasks', requireAuth, validateTask.validateTaskCreate, taskController.createTask);
router.get('/tasks', requireAuth, taskController.getAllTasks);
router.get('/tasks/my-tasks', requireAuth, taskController.getMyTasks);
router.get('/tasks/search', requireAuth, taskController.searchTasks);
router.get('/tasks/team/:teamId', requireAuth, requireTeamAccess, validateTeam.validateTeamId, taskController.getTasksByTeam);
router.get('/tasks/user/:userId', requireAuth, taskController.getTasksByUser);
router.get('/tasks/:taskId', requireAuth, requireTaskAccess, validateTask.validateTaskId, taskController.getTaskById);
router.put('/tasks/:taskId', requireAuth, requireTaskAccess, validateTask.validateTaskId, validateTask.validateTaskUpdate, taskController.updateTask);
router.delete('/tasks/:taskId', requireAuth, requireTaskAccess, validateTask.validateTaskId, taskController.deleteTask);
router.put('/tasks/:taskId/assign', requireAuth, requireTaskAccess, validateTask.validateTaskId, validateTask.validateTaskAssign, taskController.assignTask);
router.put('/tasks/:taskId/unassign', requireAuth, requireTaskAccess, validateTask.validateTaskId, taskController.unassignTask);
router.put('/tasks/:taskId/complete', requireAuth, requireTaskAccess, validateTask.validateTaskId, taskController.completeTask);
router.put('/tasks/:taskId/pending', requireAuth, requireTaskAccess, validateTask.validateTaskId, taskController.pendingTask);


router.post('/teamCreate', requireAuth, validateTeam.validateTeamCreate, teamController.createTeam);
router.get('/teams', requireAuth, teamController.getUserTeams);
router.get('/teams/:teamId', requireAuth, requireTeamAccess, validateTeam.validateTeamId, teamController.getTeamById);
router.put('/teams/:teamId', requireAuth, requireTeamAccess, validateTeam.validateTeamId, validateTeam.validateTeamUpdate, teamController.updateTeam);
router.delete('/teams/:teamId', requireAuth, requireTeamAccess, validateTeam.validateTeamId, teamController.deleteTeam);
router.get('/teams/:teamId/members', requireAuth, requireTeamAccess, validateTeam.validateTeamId, teamController.getTeamMembers);
router.post('/teams/:teamId/members', requireAuth, requireTeamAccess, validateTeam.validateTeamId, validateTeam.validateAddMember, teamController.addMember);
router.delete('/teams/:teamId/members/:userId', requireAuth, requireTeamAccess, validateTeam.validateTeamId, validateTeam.validateUserId, teamController.removeMember);
router.get('/teams/:teamId/tasks', requireAuth, requireTeamAccess, validateTeam.validateTeamId, teamController.getTeamTasks);
router.get('/teams/:teamId/statistics', requireAuth, requireTeamAccess, validateTeam.validateTeamId, teamController.getTeamStatistics);

// HEALTH CHECK
router.get('/health', (req, res) => {
    res.json({ health: 'Check' });
});

module.exports = router;