import Class from '../models/Class.js';
import User from '../models/User.js'; // Import the User model
import { hashPasswordDirect } from '../middleware/hashPassword.js'; // Import hashPasswordDirect utility

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
        const classItem = await Class.findOne({ _id: id, user: req.user.id }).populate('students');

        if (!classItem) {
            return res.status(404).json({ success: false, message: 'Class not found or user not authorized' });
        }

        // Map students to include a 'name' field for the frontend
        const studentsWithNames = classItem.students.map(student => ({
            _id: student._id,
            name: `${student.firstName} ${student.lastName}`,
            // Add any other student fields you need in the frontend
        }));

        res.status(200).json({ ...classItem.toObject(), students: studentsWithNames });
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

// Add a student to a class
export const addStudentToClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { studentId } = req.body;

        console.log('Attempting to add student to class:', { classId, studentId });

        const classItem = await Class.findById(classId);

        if (!classItem) {
            console.log('Class not found for ID:', classId);
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        console.log('Class found:', classItem.subjectName);
        console.log('Current students in class:', classItem.students);

        // Check if student already exists in the class
        if (classItem.students.includes(studentId)) {
            console.log('Student already in this class:', studentId);
            return res.status(400).json({ success: false, message: 'Student already in this class' });
        }

        classItem.students.push(studentId);
        console.log('Students array after push:', classItem.students);
        await classItem.save();
        console.log('Class saved successfully with new student.');

        res.status(200).json({ success: true, message: 'Student added to class successfully', class: classItem });
    } catch (error) {
        console.error('Error adding student to class:', error);
        res.status(500).json({ success: false, message: 'Error adding student to class', error: error.message });
    }
};

// Create a new student and add to a class
export const createAndAddStudentToClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { firstName, lastName } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ success: false, message: 'First name and last name are required' });
        }

        // Generate a placeholder email and password for the student
        const placeholderEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}@student.com`;
        const placeholderPassword = Math.random().toString(36).slice(-8); // Random 8-character password

        // Hash the placeholder password
        const hashedPassword = await hashPasswordDirect(placeholderPassword);

        // Create a new User with 'student' role
        const newStudent = new User({
            email: placeholderEmail,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'student'
        });

        await newStudent.save();

        // Add the new student's ID to the class
        const classItem = await Class.findById(classId);

        if (!classItem) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Check if student already exists in the class (by ID)
        if (classItem.students.includes(newStudent._id)) {
            return res.status(400).json({ success: false, message: 'Student already in this class' });
        }

        classItem.students.push(newStudent._id);
        await classItem.save();

        res.status(201).json({
            success: true,
            message: 'Student created and added to class successfully',
            student: {
                id: newStudent._id,
                firstName: newStudent.firstName,
                lastName: newStudent.lastName,
                email: newStudent.email
            },
            class: classItem
        });

    } catch (error) {
        console.error('Error creating and adding student to class:', error);
        return res.status(500).json({ success: false, message: 'Error creating and adding student to class', error: error.message });
    }
};