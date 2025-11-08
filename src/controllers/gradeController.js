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
        res.status(201).json({ message: 'Grades saved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};