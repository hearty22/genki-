import express from 'express';
import {
    getAssessmentsByClass,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    getCalculatedGrade,
    getStudentsByClass,
    getGradesByAssessment,
    updateGrades,
    getAssessmentById
} from '../controllers/assessmentController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Routes for assessments
router.route('/')
    .post(authenticateToken, createAssessment);

router.route('/:id')
    .get(authenticateToken, getAssessmentById)
    .put(authenticateToken, updateAssessment)
    .delete(authenticateToken, deleteAssessment);

router.route('/course/:classId')
    .get(authenticateToken, getAssessmentsByClass);

// Route for calculated grades
router.route('/:assessmentId/student/:studentId/grade')
    .get(authenticateToken, getCalculatedGrade);

// Routes for grades and students related to assessments
router.route('/:classId/students').get(authenticateToken, getStudentsByClass);
router.route('/:assessmentId/grades')
    // TODO: Consider re-enabling role-based authorization if needed in the future.
    .get(authenticateToken, getGradesByAssessment)
    .put(authenticateToken, updateGrades);

export default router;