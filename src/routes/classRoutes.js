import express from 'express';
import { createClass, getClasses, updateClass, deleteClass } from '../controllers/classController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all class routes
router.use(authenticateToken);

// Route to create a new class
router.post('/', createClass);

// Route to get all classes for the authenticated user
router.get('/', getClasses);

// Route to update a class by ID
router.put('/:id', updateClass);

// Route to delete a class by ID
router.delete('/:id', deleteClass);

export default router;