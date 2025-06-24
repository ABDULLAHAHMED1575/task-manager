const { body, param, query } = require('express-validator');

const validateTaskCreate = [
    body('title')
        .isLength({ min: 3, max: 200 })
        .withMessage('Task title must be between 3 and 200 characters')
        .trim(),
    
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
    
    body('team_id')
        .isInt({ min: 1 })
        .withMessage('Valid team ID is required'),
    
    body('assigned_to')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Assigned user must be a valid user ID')
];

const validateTaskUpdate = [
    body('title')
        .optional()
        .isLength({ min: 3, max: 200 })
        .withMessage('Task title must be between 3 and 200 characters')
        .trim(),
    
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
    
    body('status')
        .optional()
        .isIn(['PENDING', 'COMPLETED'])
        .withMessage('Status must be either PENDING or COMPLETED'),
    
    body('assigned_to')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Assigned user must be a valid user ID')
];

const validateTaskAssign = [
    body('user_id')
        .isInt({ min: 1 })
        .withMessage('Valid user ID is required')
];

const validateTaskId = [
    param('taskId')
        .isInt({ min: 1 })
        .withMessage('Valid task ID is required')
];

const validateTaskSearch = [
    query('q')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters'),
    
    query('status')
        .optional()
        .isIn(['PENDING', 'COMPLETED'])
        .withMessage('Status must be either PENDING or COMPLETED'),
    
    query('team_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Team ID must be a valid number'),
    
    query('assigned_to')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Assigned user must be a valid user ID')
];

module.exports = {
    validateTaskCreate,
    validateTaskUpdate,
    validateTaskAssign,
    validateTaskId,
    validateTaskSearch
};