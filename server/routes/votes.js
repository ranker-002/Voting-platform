import express from 'express';
import { castVote, getVoteResults } from '../controllers/voteController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, castVote);
router.get('/:electionId/results', authenticateToken, getVoteResults);

export const voteRouter = router;