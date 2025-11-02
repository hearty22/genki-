import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    createClass,
    getClasses,
    getClassById,
    updateClass,
    deleteClass,
    getStudentsByClass,
    addStudentToClass,
    createAndAddStudentToClass
} from '../controllers/classController.js';

const router = express.Router();

// Route to create a new class
router.post('/', authenticateToken, createClass);

// Route to get all classes for the authenticated user
router.get('/', authenticateToken, getClasses);

// Route to get a single class by ID
router.get('/:id', authenticateToken, getClassById);

// Route to update a class by ID
router.put('/:id', authenticateToken, updateClass);

// Route to delete a class by ID
router.delete('/:id', authenticateToken, deleteClass);

// Route to get students by class ID
router.get('/:classId/students', authenticateToken, getStudentsByClass);

// Route to add a student to a class
router.post('/:classId/students', authenticateToken, addStudentToClass);
router.post('/:classId/students/create', authenticateToken, createAndAddStudentToClass);

export default router;