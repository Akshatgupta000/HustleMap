import express from 'express';
import {
  register,
  login,
  getExtensionId,
  getUserProfile,
  updateUserProfile
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/extension-id', authenticateToken, getExtensionId);

router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, upload.single('resumePdf'), updateUserProfile);

export default router;
