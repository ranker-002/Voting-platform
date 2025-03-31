import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateVote } from '../middleware/validators.js';
import { 
  castVote, 
  getElectionResults,
  getUserVotingHistory
} from '../controllers/voteController.js';

const router = express.Router();

// Cast a vote
router.post('/', authenticateToken, validateVote, castVote);

// Get election results
router.get('/results/:electionId', authenticateToken, getElectionResults);

// Get user's voting history
router.get('/history', authenticateToken, getUserVotingHistory);

export default router;