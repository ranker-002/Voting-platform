import express from 'express';
import {
  createElection,
  updateElection,
  deleteElection
} from '../controllers/electionController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken, isAdmin);

router.post('/elections', createElection);
router.put('/elections/:id', updateElection);
router.delete('/elections/:id', deleteElection);

export const adminRouter = router;