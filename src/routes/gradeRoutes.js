import express from 'express';
import { getGradesByCourse, saveGrades } from '../controllers/gradeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.route('/course/:courseId').get(authenticateToken, getGradesByCourse);
router.route('/').post(authenticateToken, saveGrades);

export default router;