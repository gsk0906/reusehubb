import { Router } from 'express';
import { body } from 'express-validator';
import {
  getItems,
  getMyItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  markItemAsSold,
} from '../controllers/itemsController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validator.js';

const router = Router();

// Public item queries
router.get('/', getItems);
router.get('/mine', authenticate, getMyItems);
router.get('/:id', getItemById);

// Create item
router.post(
  '/',
  authenticate,
  [
    body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters.'),
    body('description').trim().notEmpty().withMessage('Description is required.'),
    body('category').trim().notEmpty().withMessage('Category is required.'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a valid number >= 0.'),
    body('condition').optional().trim(),
    body('condition_type').optional().trim(),
  ],
  validateRequest,
  createItem
);

// Update item
router.put('/:id', authenticate, updateItem);

// Mark item as sold
router.patch('/:id/sold', authenticate, markItemAsSold);

// Delete item
router.delete('/:id', authenticate, deleteItem);

export default router;
