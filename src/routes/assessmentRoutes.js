import express from 'express';
import { getAssessmentsByClass, getStudentsByClass, getGradesByAssessment, updateGrades } from '../controllers/assessmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all assessment routes
router.use(authenticateToken);

// Route to get assessments for a specific class
router.get('/courses/:classId/assessments', getAssessmentsByClass);

// Route to get students for a specific class
router.get('/courses/:classId/students', getStudentsByClass);

// Route to get grades for a specific assessment
router.get('/assessments/:assessmentId/grades', getGradesByAssessment);

// Route to update grades for a specific assessment (batch update)
router.put('/assessments/:assessmentId/grades', updateGrades);

export default router;