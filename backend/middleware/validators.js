import { body, param, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateElection = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value, { req }) => {
      const start = new Date(value);
      const now = new Date();
      if (start < now) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value, { req }) => {
      const end = new Date(value);
      const start = new Date(req.body.startDate);
      if (end <= start) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('options')
    .isArray({ min: 2 })
    .withMessage('At least 2 options are required'),
  
  body('options.*.title')
    .trim()
    .notEmpty()
    .withMessage('Option title is required')
    .isLength({ max: 255 })
    .withMessage('Option title must be less than 255 characters'),
  
  body('options.*.description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Option description must be less than 1000 characters'),
  
  handleValidationErrors
];

export const validateVote = [
  body('electionId')
    .notEmpty()
    .withMessage('Election ID is required')
    .isInt()
    .withMessage('Invalid election ID'),
  
  body('optionId')
    .notEmpty()
    .withMessage('Option ID is required')
    .isInt()
    .withMessage('Invalid option ID'),
  
  handleValidationErrors
];

export const validateElectionStatus = [
  param('id')
    .isInt()
    .withMessage('Invalid election ID'),
  
  body('status')
    .isIn(['upcoming', 'active', 'closed'])
    .withMessage('Invalid status value'),
  
  handleValidationErrors
];