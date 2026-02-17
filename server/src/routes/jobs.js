import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAllJobs,
  getStats,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllJobs);
router.get('/stats', getStats);
router.get('/:id', getJobById);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;
