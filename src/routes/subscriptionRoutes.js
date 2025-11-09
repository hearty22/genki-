import express from 'express';
import { subscribe, getVapidPublicKey } from '../controllers/subscriptionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/subscribe', authenticateToken, subscribe);
router.get('/vapidPublicKey', authenticateToken ,getVapidPublicKey);

export default router;