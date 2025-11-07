import express from 'express';
import { generateAttendanceReport, generateGradeReport } from '../controllers/reportController.js';

const router = express.Router();

router.get('/attendance/:format', generateAttendanceReport);
router.get('/grades/:format', generateGradeReport);

export default router;