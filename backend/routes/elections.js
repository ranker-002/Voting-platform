import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { validateElection } from '../middleware/validators.js';
import { 
  getAllElections,
  getElectionById,
  createElection,
  updateElectionStatus,
  deleteElection
} from '../controllers/electionController.js';

const router = express.Router();

// Debug log to check if the route file is being loaded
console.log('Election routes loaded');

// Get all elections
router.get('/', async (req, res, next) => {
  console.log('GET /api/elections called');
  getAllElections(req, res).catch(next);
});

// Get specific election
router.get('/:id', async (req, res, next) => {
  console.log(`GET /api/elections/${req.params.id} called`);
  getElectionById(req, res).catch(next);
});

// Create new election (admin only)
router.post('/', 
  authenticateToken, 
  isAdmin,
  validateElection,
  async (req, res, next) => {
    console.log('POST /api/elections called', req.body);
    createElection(req, res).catch(next);
  }
);

// Update election status (admin only)
router.patch('/:id/status',
  authenticateToken,
  isAdmin,
  body('status').isIn(['upcoming', 'active', 'closed']),
  async (req, res, next) => {
    console.log(`PATCH /api/elections/${req.params.id}/status called`);
    updateElectionStatus(req, res).catch(next);
  }
);

// Delete election (admin only)
router.delete('/:id',
  authenticateToken,
  isAdmin,
  async (req, res, next) => {
    console.log(`DELETE /api/elections/${req.params.id} called`);
    deleteElection(req, res).catch(next);
  }
);

export default router;
