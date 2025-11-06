import express from 'express';
import { getScheduledClasses, getAttendanceByClassAndDate, saveAttendance } from '../controllers/attendanceController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/scheduled-classes', authenticateToken, getScheduledClasses);
router.get('/:classId/:date', authenticateToken, getAttendanceByClassAndDate);
router.put('/', authenticateToken, saveAttendance);

export default router;
