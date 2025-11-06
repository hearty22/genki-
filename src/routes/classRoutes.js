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
    .get(authenticateToken, requireRole(['docente', 'admin']), getStudentsForClass)
    .post(authenticateToken, requireRole(['docente', 'admin']), addStudentToClass);

router.route('/:id/students/:studentId')
    .delete(authenticateToken, requireRole(['docente', 'admin']), removeStudentFromClass);

export default router;