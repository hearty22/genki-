import PDFDocument from 'pdfkit-table';
import { stringify } from 'csv-stringify';
import Attendance from '../models/Attendance.js';
import Grade from '../models/Grade.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import { Parser } from 'json2csv';
import Assessment from '../models/Assessment.js';
// Generate Attendance Report
export const generateAttendanceReport = async (req, res) => {
    const { format } = req.params;
    const { courseId } = req.query;

    try {
        const attendanceRecords = await Attendance.find({ classId: courseId }).populate('records.studentId', 'firstName lastName');

        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(404).send('No attendance records found for this course.');
        }

        const students = {};
        const classDates = [...new Set(attendanceRecords.map(record => new Date(record.date).toLocaleDateString()))];

        attendanceRecords.forEach(record => {
            const date = new Date(record.date).toLocaleDateString();
            record.records.forEach(rec => {
                const studentName = `${rec.studentId.firstName} ${rec.studentId.lastName}`;
                if (!students[studentName]) {
                    students[studentName] = { student: studentName };
                }
                students[studentName][date] = rec.status;
            });
        });

        const data = Object.values(students);

        if (format === 'pdf') {
            const doc = new PDFDocument();
            let filename = `attendance-report-${courseId}.pdf`;
            filename = encodeURIComponent(filename);
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');

            doc.fontSize(18).text(`Attendance Report for Course ID: ${courseId}`, { align: 'center' });
            doc.moveDown();

            const table = {
                headers: ['Student', ...classDates],
                rows: []
            };

            for (const student of data) {
                const row = [student.student];
                for (const date of classDates) {
                    row.push(student[date] || 'N/A');
                }
                table.rows.push(row);
            }

            doc.table(table, { width: 500 });
            doc.pipe(res);
            doc.end();
        } else if (format === 'csv') {
            const fields = ['student', ...classDates];
            const opts = { fields, delimiter: ';' };
            const parser = new Parser(opts);
            const csv = parser.parse(data);

            res.header('Content-Type', 'text/csv');
            res.attachment(`attendance-report-${courseId}.csv`);
            res.send(csv);
        } else {
            res.status(400).send('Invalid format specified');
        }
    } catch (error) {
        console.error('Error generating attendance report:', error);
        res.status(500).send('Error generating attendance report');
    }
};

// Generate Grade Report
export const generateGradeReport = async (req, res) => {
    const { courseId } = req.query;
    const { format } = req.params;

    try {
        const assessments = await Assessment.find({ course: courseId });

        if (!assessments || assessments.length === 0) {
            return res.status(404).send('No assessments found for this course.');
        }

        const assessmentIds = assessments.filter(a => !a.isCalculated).map(assessment => assessment._id);

        const grades = await Grade.find({ assessment: { $in: assessmentIds } })
            .populate('student', 'firstName lastName')
            .populate('assessment', 'name');

        const studentsInCourse = await User.find({ 'courses.class': courseId });
        const calculatedGrades = [];

        for (const assessment of assessments) {
            if (assessment.isCalculated) {
                for (const student of studentsInCourse) {
                    let calculatedGrade = 0;
                    for (const component of assessment.calculationFormula) {
                        const gradeEntry = await Grade.findOne({ assessment: component.assessment, student: student._id });
                        const grade = gradeEntry ? gradeEntry.grade : 0;
                        calculatedGrade += (grade * component.weight) / 100;
                    }

                    const roundedGrade = Math.round(calculatedGrade * (10 ** assessment.rounding)) / (10 ** assessment.rounding);

                    calculatedGrades.push({
                        student: {
                            _id: student._id,
                            firstName: student.firstName,
                            lastName: student.lastName
                        },
                        assessment: {
                            _id: assessment._id,
                            name: assessment.name
                        },
                        grade: roundedGrade
                    });
                }
            }
        }

        const allGrades = [...grades, ...calculatedGrades];

        if (!allGrades || allGrades.length === 0) {
            return res.status(404).send('No grades found for this course.');
        }

        if (format === 'pdf') {
            const students = {};
            allGrades.forEach(grade => {
                const studentName = `${grade.student.firstName} ${grade.student.lastName}`;
                if (!students[studentName]) {
                    students[studentName] = { student: studentName };
                }
                students[studentName][grade.assessment.name] = grade.grade;
            });

            const data = Object.values(students);
            const assessmentNames = [...new Set(allGrades.map(grade => grade.assessment.name))];

            const doc = new PDFDocument();
            let filename = `grade-report-${courseId}.pdf`;
            filename = encodeURIComponent(filename);
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');

            doc.fontSize(18).text(`Grade Report for Course ID: ${courseId}`, { align: 'center' });
            doc.moveDown();

            const table = {
                headers: ['Student', ...assessmentNames],
                rows: []
            };

            for (const student of data) {
                const row = [student.student];
                for (const assessmentName of assessmentNames) {
                    row.push(student[assessmentName] || 'N/A');
                }
                table.rows.push(row);
            }

            doc.table(table, { width: 500 });
            doc.pipe(res);
            doc.end();
        } else if (format === 'csv') {
            const students = {};
            allGrades.forEach(grade => {
                const studentName = `${grade.student.firstName} ${grade.student.lastName}`;
                if (!students[studentName]) {
                    students[studentName] = { student: studentName };
                }
                students[studentName][grade.assessment.name] = grade.grade;
            });

            const data = Object.values(students);
            const assessmentNames = [...new Set(allGrades.map(grade => grade.assessment.name))];
            const fields = ['student', ...assessmentNames];
            const opts = { fields, delimiter: ';' };
            const parser = new Parser(opts);
            const csv = parser.parse(data);

            res.header('Content-Type', 'text/csv');
            res.attachment(`grade-report-${courseId}.csv`);
            res.send(csv);
        }
    } catch (error) {
        console.error('Error generating grade report:', error);
        res.status(500).send('Error generating grade report');
    }
};