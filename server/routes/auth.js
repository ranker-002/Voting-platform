import express from 'express';
import { register, login, refreshToken, me } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/me', authenticateToken, me);

export const authRouter = router;