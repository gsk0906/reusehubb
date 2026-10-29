import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  getLoginActivity,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// Apply authentication and admin-only access check to all admin routes
router.use(authenticate, adminOnly);

// List all registered users
router.get('/users', getAllUsers);

// Get specific user with listings and login history
router.get('/users/:id', getUserById);

// Get platform-wide login activity
router.get('/login-activity', getLoginActivity);

export default router;
