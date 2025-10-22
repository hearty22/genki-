import Class from '../models/Class.js';
import User from '../models/User.js';
import Assessment from '../models/Assessment.js';

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
            firstName: student.firstName,
            lastName: student.lastName
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
        const grades = dummyGrades[assessmentId] ? Object.keys(dummyGrades[assessmentId]).map(studentId => ({
            studentId,
            grade: dummyGrades[assessmentId][studentId]
        })) : [];
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

        // In a real app, update grades in DB
        // For now, update dummy grades
        dummyGrades[assessmentId] = {};
        grades.forEach(({ studentId, grade }) => {
            dummyGrades[assessmentId][studentId] = grade;
        });

        res.status(200).json({ success: true, message: 'Grades updated successfully' });
    } catch (error) {
        console.error('Error updating grades:', error);
        res.status(500).json({ success: false, message: 'Error updating grades', error: error.message });
    }
};

// Create a new assessment
export const createAssessment = async (req, res) => {
    try {
        const { name, course: courseId, date, maxGrade } = req.body;
        const newAssessment = new Assessment({
            name,
            course: courseId,
            date,
            maxGrade
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
        const { name, course: courseId, date, maxGrade } = req.body;

        const updatedAssessment = await Assessment.findByIdAndUpdate(id, {
            name,
            course: courseId,
            date,
            maxGrade
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

        const deletedAssessment = await Assessment.findByIdAndDelete(id);

        if (!deletedAssessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        res.status(200).json({ success: true, message: 'Assessment deleted successfully' });
    } catch (error) {
        console.error('Error deleting assessment:', error);
        res.status(500).json({ success: false, message: 'Error deleting assessment', error: error.message });
    }
};