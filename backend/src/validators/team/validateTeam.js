const { body, param } = require('express-validator');

const validateTeamCreate = [
    body('name')
        .isLength({ min: 3, max: 100 })
        .withMessage('Team name must be between 3 and 100 characters')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Team name can only contain letters, numbers, spaces, hyphens, and underscores'),
    
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters')
];

const validateTeamUpdate = [
    body('name')
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage('Team name must be between 3 and 100 characters')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Team name can only contain letters, numbers, spaces, hyphens, and underscores'),
    
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters')
];

const validateAddMember = [
    body('userId')
        .isInt({ min: 1 })
        .withMessage('Valid user ID is required')
];

const validateTeamId = [
    param('teamId')
        .isInt({ min: 1 })
        .withMessage('Valid team ID is required')
];

const validateUserId = [
    param('userId')
        .isInt({ min: 1 })
        .withMessage('Valid user ID is required')
];

module.exports = {
    validateTeamCreate,
    validateTeamUpdate,
    validateAddMember,
    validateTeamId,
    validateUserId
};