import express from 'express';
const router = express.Router();
import { authenticateToken } from '../middleware/auth.js';
import * as reportController from '../controllers/reportController.js';

// Route to generate attendance report (PDF/CSV)
router.get('/attendance/:format', authenticateToken, reportController.generateAttendanceReport);

// Route to generate grade report (PDF/CSV)
router.get('/grades/:format', authenticateToken, reportController.generateGradeReport);

export default router;