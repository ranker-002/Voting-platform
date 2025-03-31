import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { getAllUsers as getUsers, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', authenticateToken, isAdmin, getUsers);  
router.delete('/:id', authenticateToken, isAdmin, deleteUser);

export default router;
