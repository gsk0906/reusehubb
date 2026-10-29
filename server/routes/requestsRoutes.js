import { Router } from 'express';
import { body } from 'express-validator';
import {
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  updateRequestStatus,
} from '../controllers/requestsController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validator.js';

const router = Router();

// Send request
router.post(
  '/',
  authenticate,
  [
    body('itemId')
      .optional()
      .notEmpty()
      .withMessage('Valid item ID is required.'),
  ],
  validateRequest,
  sendRequest
);

// Get requests received (as seller)
router.get('/received', authenticate, getReceivedRequests);

// Get requests sent (as buyer)
router.get('/sent', authenticate, getSentRequests);

// Update request status (accepted / rejected)
router.patch('/:id', authenticate, updateRequestStatus);

export default router;
