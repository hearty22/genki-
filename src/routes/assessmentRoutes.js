import express from 'express';

import { authenticateToken } from '../middleware/auth.js';

import { getAssessmentsByClass, getStudentsByClass, getGradesByAssessment, updateGrades, createAssessment, updateAssessment, deleteAssessment } from '../controllers/assessmentController.js';

const router = express.Router();

router.get('/courses/:classId/assessments', authenticateToken, getAssessmentsByClass);
router.get('/courses/:classId/students', authenticateToken, getStudentsByClass);
router.get('/:assessmentId/grades', authenticateToken, getGradesByAssessment);
router.put('/:assessmentId/grades', authenticateToken, updateGrades);
router.put('/:id', authenticateToken, updateAssessment);
router.post('/', authenticateToken, createAssessment);
router.delete('/:id', authenticateToken, deleteAssessment);

export default router;