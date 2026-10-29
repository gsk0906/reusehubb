import { Router } from 'express';
import { getMe, updateMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Alias for /api/users/me matching existing frontend calls
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);

export default router;
