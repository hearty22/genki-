import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify';

const generateAttendanceReport = async (req, res) => {
    const { format } = req.params;

    if (format === 'pdf') {
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.pdf"');

        doc.pipe(res);

        doc.fontSize(25).text('Attendance Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text('This is a placeholder attendance report.');

        doc.end();
    } else if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.csv"');

        const columns = [
            { key: 'studentName', header: 'Student Name' },
            { key: 'status', header: 'Status' },
            { key: 'date', header: 'Date' }
        ];
        const data = [
            { studentName: 'John Doe', status: 'Present', date: '2023-10-26' },
            { studentName: 'Jane Smith', status: 'Absent', date: '2023-10-26' }
        ];

        stringify(data, { header: true, columns: columns }, (err, output) => {
            if (err) {
                return res.status(500).send('Error generating CSV');
            }
            res.send(output);
        });
    } else {
        res.status(400).send('Invalid format specified');
    }
};

const generateGradeReport = async (req, res) => {
    const { format } = req.params;

    if (format === 'pdf') {
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="grade_report.pdf"');

        doc.pipe(res);

        doc.fontSize(25).text('Grade Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text('This is a placeholder grade report.');

        doc.end();
    } else if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="grade_report.csv"');

        const columns = [
            { key: 'studentName', header: 'Student Name' },
            { key: 'assessment', header: 'Assessment' },
            { key: 'grade', header: 'Grade' }
        ];
        const data = [
            { studentName: 'John Doe', assessment: 'Midterm', grade: 'A' },
            { studentName: 'Jane Smith', assessment: 'Midterm', grade: 'B' }
        ];

        stringify(data, { header: true, columns: columns }, (err, output) => {
            if (err) {
                return res.status(500).send('Error generating CSV');
            }
            res.send(output);
        });
    } else {
        res.status(400).send('Invalid format specified');
    }
};

export {
    generateAttendanceReport,
    generateGradeReport
};