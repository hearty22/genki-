import Class from '../models/Class.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// @desc    Get scheduled classes for the current day
// @route   GET /api/attendance/scheduled-classes
// @access  Private (Teachers only)
export const getScheduledClasses = async (req, res) => {
    try {
        const teacherId = req.user.id; // Assuming req.user.id contains the teacher's ID
        const today = new Date();
        const currentDayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const todayName = dayNames[currentDayOfWeek];

        // Find classes for the current teacher scheduled for today
        const classes = await Class.find({ 
            user: teacherId,
            dayOfWeek: dayNames[currentDayOfWeek],
            students: { $exists: true, $ne: [] } 
        }).populate('students');

        res.json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get attendance records for a specific class and date
// @route   GET /api/attendance/:classId/:date
// @access  Private (Teachers only)
export const getAttendanceByClassAndDate = async (req, res) => {
    try {
        const { classId, date } = req.params;
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const attendanceRecords = await Attendance.find({
            classId,
            date: attendanceDate,
        }).populate('records.studentId', 'firstName lastName');

        const formattedAttendanceRecords = attendanceRecords.map(record => {
            const formattedRecords = record.records.map(studentRecord => {
                const studentName = studentRecord.studentId ? `${studentRecord.studentId.firstName} ${studentRecord.studentId.lastName}` : 'Unknown Student';
                return {
                    studentId: studentRecord.studentId ? studentRecord.studentId._id : null,
                    name: studentName,
                    status: studentRecord.status
                };
            });
            return {
                _id: record._id,
                classId: record.classId,
                date: record.date,
                startTime: record.startTime,
                records: formattedRecords
            };
        });

        res.status(200).json(formattedAttendanceRecords);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Save attendance records for a class on a specific date
// @route   PUT /api/attendance
// @access  Private (Teachers only)
export const saveAttendance = async (req, res) => {
    try {
        const { classId, date, startTime, records } = req.body;
        const teacherId = req.user.id;
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            classId,
            date: attendanceDate,
            startTime
        });

        if (attendance) {
            // Update existing attendance record
            attendance.records = records.map(record => ({
                studentId: record.studentId,
                status: record.status
            }));
            await attendance.save();

            // Create notifications for absent students
            for (const record of records) {
                if (record.status === 'absent') {
                    const student = await User.findById(record.studentId);
                    if (student) {
                        const message = `El estudiante ${student.firstName} ${student.lastName} estuvo ausente en la clase de hoy.`;
                        await createNotification(teacherId, message, 'warning');
                    }
                }
            }

            res.status(200).json({ message: 'Attendance updated successfully', attendance });
        } else {
            // Create new attendance record
            attendance = new Attendance({
                classId,
                date: attendanceDate,
                startTime,
                records: records.map(record => ({
                    studentId: record.studentId,
                    status: record.status
                })),
                teacherId
            });
            await attendance.save();

            // Create notifications for absent students
            for (const record of records) {
                if (record.status === 'absent') {
                    const student = await User.findById(record.studentId);
                    if (student) {
                        const message = `El estudiante ${student.firstName} ${student.lastName} estuvo ausente en la clase de hoy.`;
                        await createNotification(teacherId, message, 'warning');
                    }
                }
            }

            res.status(201).json({ message: 'Attendance saved successfully', attendance });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
