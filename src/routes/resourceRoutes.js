import express from 'express';
import { getResources, uploadResource } from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';
import resourceUpload from '../middleware/resourceUpload.js';

const router = express.Router();

router.route('/').get(protect, getResources).post(protect, resourceUpload.single('file'), uploadResource);

export default router;