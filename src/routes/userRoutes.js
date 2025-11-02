import express from 'express';
import { searchUsers } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(authenticateToken);

// Route to search for users by name or email
router.get('/search', searchUsers);

export default router;