import Class from '../models/Class.js';
import User from '../models/User.js';
import Assessment from '../models/Assessment.js';
import Grade from '../models/Grade.js';

// Dummy data for assessments and grades for demonstration
// In a real application, these would come from a database
const dummyAssessments = {
    // classId: [{ id: 'assessmentId1', name: 'Parcial 1' }, { id: 'assessmentId2', name: 'Trabajo Práctico' }]
};

const dummyGrades = {
    // assessmentId: { studentId: grade }
};

// Get assessments by course (class)
export const getAssessmentsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const assessments = await Assessment.find({ course: classId });
        res.status(200).json(assessments);
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ success: false, message: 'Error fetching assessments', error: error.message });
    }
};

// Get students by course (class)
export const getStudentsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        // In a real app, fetch students enrolled in this class from DB
        // For now, return dummy students
        const classItem = await Class.findById(classId).populate('students'); // Assuming Class model has a 'students' field

        if (!classItem) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Assuming students are populated and have firstName, lastName, and id
        const students = classItem.students.map(student => ({
            id: student._id,
            name: student.name
        }));

        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Error fetching students', error: error.message });
    }
};

// Get grades by assessment
export const getGradesByAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        // In a real app, fetch grades for this assessmentId from DB
        // For now, return dummy grades
        const grades = await Grade.find({ assessment: assessmentId });
        res.status(200).json(grades);
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ success: false, message: 'Error fetching grades', error: error.message });
    }
};

// Update grades for an assessment (batch update)
export const updateGrades = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const { grades } = req.body; // grades is an array of { studentId, grade }

        const promises = grades.map(g => {
            return Grade.findOneAndUpdate(
                { assessment: assessmentId, student: g.studentId },
                { grade: g.grade },
                { upsert: true, new: true }
            );
        });
        await Promise.all(promises);
        res.status(200).json({ success: true, message: 'Grades updated successfully' });
    } catch (error) {
        console.error('Error updating grades:', error);
        res.status(500).json({ success: false, message: 'Error updating grades', error: error.message });
    }
};

// Create a new assessment
export const createAssessment = async (req, res) => {
    try {
        const { name, course, date, maxGrade, isCalculated, calculationFormula, rounding } = req.body;

        if (isCalculated) {
            const totalWeight = calculationFormula.reduce((sum, item) => sum + item.weight, 0);
            if (totalWeight !== 100) {
                return res.status(400).json({ message: 'The sum of the weights must be 100%' });
            }
        }

        const newAssessment = new Assessment({
            name,
            course,
            date,
            maxGrade,
            isCalculated,
            calculationFormula,
            rounding
        });
        const savedAssessment = await newAssessment.save();
        res.status(201).json({ success: true, message: 'Assessment created successfully', assessment: savedAssessment });
    } catch (error) {
        console.error('Error creating assessment:', error);
        res.status(500).json({ success: false, message: 'Error creating assessment', error: error.message });
    }
};

// Update an existing assessment
export const updateAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, course, date, maxGrade, isCalculated, calculationFormula, rounding } = req.body;

        if (isCalculated) {
            const totalWeight = calculationFormula.reduce((sum, item) => sum + item.weight, 0);
            if (totalWeight !== 100) {
                return res.status(400).json({ message: 'The sum of the weights must be 100%' });
            }
        }

        const updatedAssessment = await Assessment.findByIdAndUpdate(id, {
            name,
            course,
            date,
            maxGrade,
            isCalculated,
            calculationFormula,
            rounding
        }, { new: true });

        if (!updatedAssessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        res.status(200).json({ success: true, message: 'Assessment updated successfully', assessment: updatedAssessment });
    } catch (error) {
        console.error('Error updating assessment:', error);
        res.status(500).json({ success: false, message: 'Error updating assessment', error: error.message });
    }
};

// Delete an existing assessment
export const deleteAssessment = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if this assessment is part of any calculated assessment
        const calculatedAssessments = await Assessment.find({ 'calculationFormula.assessment': id });

        if (calculatedAssessments.length > 0) {
            return res.status(400).json({ message: 'This assessment cannot be deleted because it is part of a calculated assessment.' });
        }

        const deletedAssessment = await Assessment.findByIdAndDelete(id);

        // TODO: Delete all grades associated with this assessment.

        if (!deletedAssessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        res.status(200).json({ success: true, message: 'Assessment deleted successfully' });
    } catch (error) {
        console.error('Error deleting assessment:', error);
        res.status(500).json({ success: false, message: 'Error deleting assessment', error: error.message });
    }
};

// @desc    Get grade for a student in a calculated assessment
// @route   GET /api/assessments/:assessmentId/student/:studentId/grade
// @access  Private
export const getCalculatedGrade = async (req, res) => {
    try {
        const { assessmentId, studentId } = req.params;
        const assessment = await Assessment.findById(assessmentId).populate('calculationFormula.assessment');

        if (!assessment || !assessment.isCalculated) {
            return res.status(404).json({ message: 'Calculated assessment not found.' });
        }

        let calculatedGrade = 0;
        for (const component of assessment.calculationFormula) {
            // This is a simplified example. You would need a way to get the grade of the student for each component assessment.
            // For demonstration, let's assume a function getGrade(assessmentId, studentId) exists.
            // You will need to implement this function based on your data structure for grades.
            const gradeEntry = await Grade.findOne({ assessment: component.assessment._id, student: studentId });
            const grade = gradeEntry ? gradeEntry.grade : 0;
            calculatedGrade += (grade * component.weight) / 100;
        }

        const roundedGrade = Math.round(calculatedGrade * (10 ** assessment.rounding)) / (10 ** assessment.rounding);

        res.json({ studentId, grade: roundedGrade });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};