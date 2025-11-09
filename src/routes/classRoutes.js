import { Router } from 'express';
import multer from 'multer';
import {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    addStudentToClass,
    removeStudentFromClass,
    getStudentsForClass,
    getDashboardStats,
    updateStudent,
    importStudents
} from '../controllers/classController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route('/').get(authenticateToken, getClasses).post(authenticateToken, createClass);
router.route('/:id').get(authenticateToken, getClassById).put(authenticateToken, updateClass).delete(authenticateToken, deleteClass);

// Ruta para las estadísticas del dashboard
router.route('/:id/dashboard').get(authenticateToken, getDashboardStats);

// Rutas para importar alumnos
router.route('/:id/import-students').post(authenticateToken, upload.single('csv'), importStudents);

// Rutas para administrar alumnos en una clase
router.route('/:id/students')
    // TODO: Consider re-enabling role-based authorization if needed in the future.
    .get(authenticateToken, getStudentsForClass)
    .post(authenticateToken, addStudentToClass);

router.route('/:id/students/:studentId')
    .delete(authenticateToken, removeStudentFromClass)
    .put(authenticateToken, updateStudent);

export default router;