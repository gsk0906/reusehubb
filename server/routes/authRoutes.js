import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validator.js';

const router = Router();

// Registration route
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Full name is required.'),
    body('email').trim().isEmail().withMessage('Please provide a valid college email ID.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('department').optional().trim(),
    body('phone').optional().trim(),
  ],
  validateRequest,
  register
);

// Login route
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Please provide a valid email ID.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validateRequest,
  login
);

// Get logged-in user profile
router.get('/me', authenticate, getMe);

// Update logged-in user profile
router.put('/me', authenticate, updateMe);

export default router;
