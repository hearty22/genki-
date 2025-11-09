import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(authenticateToken, getNotifications);
router.route('/mark-all-as-read').put(authenticateToken, markAllAsRead);
router.route('/:id').put(authenticateToken, markAsRead);

export default router;