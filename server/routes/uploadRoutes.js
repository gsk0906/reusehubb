import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Upload image endpoint
router.post('/', authenticate, upload.single('image'), uploadImage);

export default router;
