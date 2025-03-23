import express from 'express';
import {
  getAllElections,
  getElectionById,
  getCandidates
} from '../controllers/electionController.js';

const router = express.Router();

router.get('/', getAllElections);
router.get('/:id', getElectionById);
router.get('/:id/candidates', getCandidates);

export const electionRouter = router;