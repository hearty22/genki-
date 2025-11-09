import express from 'express';
import { subscribe } from '../controllers/subscriptionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.route('/subscribe').post(authenticateToken, subscribe);

export default router;