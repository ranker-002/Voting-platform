import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateRegister = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, body('email').isEmail(), updateProfile);

export default router;