import Class from '../models/Class.js';

// Create a new class
export const createClass = async (req, res) => {
    try {
        const { subjectName, courseGroup, dayOfWeek, startTime, endTime, location, color } = req.body;
        const newClass = new Class({
            subjectName,
            courseGroup,
            dayOfWeek,
            startTime,
            endTime,
            location,
            color,
            user: req.user.id // Assuming req.user.id is set by authentication middleware
        });
        const savedClass = await newClass.save();
        res.status(201).json({ success: true, message: 'Class created successfully', class: savedClass });
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).json({ success: false, message: 'Error creating class', error: error.message });
    }
};

// Get all classes for the authenticated user
export const getClasses = async (req, res) => {
    try {
        const classes = await Class.find({ user: req.user.id });
        res.status(200).json(classes);
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ success: false, message: 'Error fetching classes', error: error.message });
    }
};

// Get a single class by ID
export const getClassById = async (req, res) => {
    try {
        const { id } = req.params;
        const classItem = await Class.findOne({ _id: id, user: req.user.id });

        if (!classItem) {
            return res.status(404).json({ success: false, message: 'Class not found or user not authorized' });
        }

        res.status(200).json(classItem);
    } catch (error) {
        console.error('Error fetching class by ID:', error);
        res.status(500).json({ success: false, message: 'Error fetching class by ID', error: error.message });
    }
};

// Update a class
export const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { subjectName, courseGroup, dayOfWeek, startTime, endTime, location, color } = req.body;

        const updatedClass = await Class.findOneAndUpdate(
            { _id: id, user: req.user.id }, // Find by ID and user to ensure ownership
            { subjectName, courseGroup, dayOfWeek, startTime, endTime, location, color },
            { new: true, runValidators: true }
        );

        if (!updatedClass) {
            return res.status(404).json({ success: false, message: 'Class not found or user not authorized' });
        }

        res.status(200).json({ success: true, message: 'Class updated successfully', class: updatedClass });
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).json({ success: false, message: 'Error updating class', error: error.message });
    }
};

// Delete a class
export const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedClass = await Class.findOneAndDelete({ _id: id, user: req.user.id });

        if (!deletedClass) {
            return res.status(404).json({ success: false, message: 'Class not found or user not authorized' });
        }

        res.status(200).json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ success: false, message: 'Error deleting class', error: error.message });
    }
};

// Get students by class
export const getStudentsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const classItem = await Class.findById(classId).populate('students');

        if (!classItem) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        const students = classItem.students.map(student => ({
            id: student._id,
            firstName: student.firstName,
            lastName: student.lastName
        }));

        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students by class:', error);
        res.status(500).json({ success: false, message: 'Error fetching students by class', error: error.message });
    }
};