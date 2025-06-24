const Membership = require('../src/models/membership');
const Task = require('../src/models/task');

const requireAuth = (req,res,next) => {
    if(req.isAuthenticated()){
        return next()
    }
    res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
    })
};

const optionalAuth = (req,res,next) => {
    next();
};

const extractUserInfo = (req, res, next) => {
    next();
};

const requireTeamAccess = async (req,res,next) => {
    try {
        if(!req.isAuthenticated()){
            return res.status(401).json({
                error: 'Authentication required'
            });
        }
        const userId = req.user.id;
        
        const teamId = req.params.teamId || req.params.id;

        if(!teamId){
            return res.status(400).json({
                error:'Team ID is required'
            });
        }

        const teamIdNum = parseInt(teamId);
        if (isNaN(teamIdNum)) {
            return res.status(400).json({
                error: 'Invalid team ID'
            });
        }

        const isMember = await Membership.exists(userId, teamIdNum);
        
        if(!isMember){
            return res.status(403).json({
                error: 'Access denied',
                message: 'You are not a member of this team'
            })
        }
        req.teamId = teamIdNum;
        next();
    } catch (error) {
        console.error('Error checking team access:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error checking team access'
        });
    }
}

const requireTaskAccess = async (req,res,next) => {
    try {
        if(!req.isAuthenticated()){
            return res.status(401).json({
                error:'Authentication required'
            });
        }
        const userId = req.user.id;
        const taskId = req.params.taskId || req.params.id;

        if(!taskId){
            return res.status(400).json({
                error: 'Task ID is required'
            });
        }
        const canAccess = await Task.canUserAccess(taskId,userId);

        if(!canAccess){
            return res.status(403).json({
                error: 'Access denied',
                message: 'You do not have access to this task'
            });
        }
        req.taskId = parseInt(taskId);
        next();
    } catch (error) {
        console.error('Error checking task access:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error checking task access'
        });
    }
}

const requireOwnership = (resourceType) => {
    return async (req,res,next) => {
        try {
            if(!req.isAuthenticated()){
                return res.status(401).json({
                    error: 'Authentication required'
                })
            }

            const userId = req.user.id;
            const resourceId = req.params.id;

            if(!resourceId){
                return res.status(400).json({
                    erro:'Resource ID is required'
                });
            }
            let hasAccess = false;

            if(resourceType === 'user'){
                hasAccess = parseInt(resourceId) === userId;
            }else if(resourceType === 'team'){
                hasAccess = await Membership.exists(userId,resourceId)
            }else if(resourceType === 'task'){
                hasAccess = await Task.canUserAccess(resourceId,userId);
            }

            if(!hasAccess){
                return res.status(403).json({
                    error: 'Access denied',
                    message: 'You do not have permission to access this resource'
                });
            }
            next();
        } catch (error) {
            console.error('Error checking ownership:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Error checking resource access'
            });
        }
    }
}

const authHelpers = {
    isAuthenticated: (req) => {
        return req.isAuthenticated();
    },

    getCurrentUser: (req) => {
        return req.user || null;
    },

    getCurrentUserId: (req) => {
        return req.user?.id || null;
    },
};

module.exports = {
    requireAuth,
    optionalAuth,
    extractUserInfo,
    requireTeamAccess,
    requireTaskAccess,
    requireOwnership,
    authHelpers
};