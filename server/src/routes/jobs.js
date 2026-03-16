import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAllJobs,
  getStats,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  captureJob,
  saveScreenshotJob,
  saveSimpleExtensionJob,
  saveFromExtension,
  getCapturedJobs,
} from '../controllers/jobController.js';

const router = express.Router();

// Extension screenshot save (no auth; uses userId in body)
router.post('/screenshot', saveScreenshotJob);

// Minimal save endpoint for simple Chrome extension integration (no auth)
router.post('/save', saveSimpleExtensionJob);

// Extension capture with extension ID (no auth)
router.post('/save-from-extension', saveFromExtension);

// All other routes require authentication
router.use(authenticateToken);

router.get('/', getAllJobs);
router.get('/stats', getStats);
router.get('/captured', getCapturedJobs);
router.post('/capture', captureJob);
router.get('/:id', getJobById);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;
