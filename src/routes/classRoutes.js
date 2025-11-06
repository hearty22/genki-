import { Router } from 'express';
import {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    addStudentToClass,
    removeStudentFromClass,
    getStudentsForClass
} from '../controllers/classController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.route('/').get(authenticateToken, getClasses).post(authenticateToken, createClass);
router.route('/:id').get(authenticateToken, getClassById).put(authenticateToken, updateClass).delete(authenticateToken, deleteClass);

// Rutas para administrar alumnos en una clase
router.route('/:id/students')
    // TODO: Consider re-enabling role-based authorization if needed in the future.
    .get(authenticateToken, getStudentsForClass)
    .post(authenticateToken, addStudentToClass);

router.route('/:id/students/:studentId')
    .delete(authenticateToken, removeStudentFromClass);

export default router;