import { createNotification } from './notificationController.js';
import User from '../models/User.js';
import Assessment from '../models/Assessment.js';
import Grade from '../models/Grade.js';
import mongoose from 'mongoose';

export const getGradesByCourse = async (req, res) => {
    try {
        const courseId = new mongoose.Types.ObjectId(req.params.courseId);

        const grades = await Grade.aggregate([
            {
                $lookup: {
                    from: 'assessments',
                    localField: 'assessment',
                    foreignField: '_id',
                    as: 'assessmentDetails'
                }
            },
            {
                $unwind: '$assessmentDetails'
            },
            {
                $match: {
                    'assessmentDetails.course': courseId
                }
            }
        ]);

        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const saveGrades = async (req, res) => {
    const { grades } = req.body;
    console.log('Received grades to save:', JSON.stringify(grades, null, 2));

    try {
        const operations = grades.map(grade => ({
            updateOne: {
                filter: { student: grade.student, assessment: grade.assessment },
                update: { $set: { grade: grade.grade } }, // Eliminar course
                upsert: true
            }
        }));

        const result = await Grade.bulkWrite(operations);

        const assessmentIds = [...new Set(grades.map(g => g.assessment))];
        const assessments = await Assessment.find({ '_id': { $in: assessmentIds } });
        const assessmentTitleMap = assessments.reduce((map, assessment) => {
            map[assessment._id.toString()] = assessment.title;
            return map;
        }, {});

        // Create notifications for failed grades
        for (const grade of grades) {
            const numericGrade = parseInt(grade.grade, 10);
            if (!isNaN(numericGrade) && numericGrade < 6) {
                const student = await User.findById(grade.student);
                const assessment = await Assessment.findById(grade.assessment).populate({ 
                    path: 'course', 
                    populate: { path: 'user' } 
                });
                if (student && assessment && assessment.course && assessment.course.user) {
                    const teacherId = assessment.course.user._id;
                    const message = `El estudiante ${student.firstName} ${student.lastName} tiene una calificación baja (${grade.grade}) en la evaluación "${assessment.name}".`;
                    await createNotification(teacherId, message, 'alert');
                }
            }
        }

        res.status(201).json({ message: 'Grades saved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};