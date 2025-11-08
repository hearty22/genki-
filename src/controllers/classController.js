import Class from '../models/Class.js';
import User from '../models/User.js'; // Import the User model
import Attendance from '../models/Attendance.js'; // Import the Attendance model
import Grade from '../models/Grade.js'; // Import the Grade model
import Assessment from '../models/Assessment.js'; // Import the Assessment model
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

// @desc    Add a student to a class
// @route   POST /api/classes/:id/students
// @access  Private
export const addStudentToClass = async (req, res) => {
    try {
        const { name } = req.body;
        const classId = req.params.id;

        if (!name) {
            return res.status(400).json({ message: 'El nombre del alumno es requerido.' });
        }

        // Dividir el nombre completo en nombre y apellido
        const nameParts = name.trim().split(' ');
        const firstName = nameParts.shift() || '';
        const lastName = nameParts.join(' ') || '';

        if (!firstName || !lastName) {
            return res.status(400).json({ message: 'Se requiere nombre y apellido.' });
        }

        // Generar un email único y ficticio
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '.')}.${Date.now()}@student.com`;

        // Crear un nuevo usuario con el rol de estudiante
        const newStudent = new User({
            firstName,
            lastName,
            email,
            role: 'student',
            // Se puede establecer una contraseña por defecto si es necesario,
            // pero para este caso no es requerido ya que no iniciarán sesión.
        });

        await newStudent.save();

        // Añadir el ID del nuevo estudiante a la clase
        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            { $push: { students: newStudent._id } },
            { new: true, runValidators: true }
        ).populate({
            path: 'students',
            select: 'firstName lastName' // Seleccionar solo los campos necesarios
        });

        if (!updatedClass) {
            return res.status(404).json({ message: 'Clase no encontrada.' });
        }

        // Mapear los estudiantes para devolver el formato esperado por el frontend
        const students = updatedClass.students.map(student => ({
            _id: student._id,
            name: `${student.firstName} ${student.lastName}`
        }));

        res.status(201).json(students);
    } catch (error) {
        console.error('Error al agregar el alumno:', error);
        res.status(500).json({ message: 'Error al agregar el alumno.', error: error.message });
    }
};

// @desc    Remove a student from a class
// @route   DELETE /api/classes/:id/students/:studentId
// @access  Private
export const removeStudentFromClass = async (req, res) => {
    try {
        const { id, studentId } = req.params;

        // Primero, elimina la referencia del alumno de la clase
        const classToUpdate = await Class.findById(id);
        if (!classToUpdate) {
            return res.status(404).json({ message: 'Clase no encontrada.' });
        }

        // Filtrar el array de estudiantes para eliminar el studentId
        classToUpdate.students.pull(studentId);
        await classToUpdate.save();

        // Opcional: Eliminar el usuario si ya no está en ninguna otra clase
        // (lógica más compleja, omitida por simplicidad)

        // Poblar la lista de estudiantes actualizada
        const updatedClass = await Class.findById(id).populate({
            path: 'students',
            select: 'firstName lastName'
        });

        // Mapear los estudiantes para devolver el formato esperado por el frontend
        const students = updatedClass.students.map(student => ({
            _id: student._id,
            name: `${student.firstName} ${student.lastName}`
        }));

        res.status(200).json(students);
    } catch (error) {
        console.error('Error al eliminar el alumno:', error);
        res.status(500).json({ message: 'Error al eliminar el alumno.', error: error.message });
    }
};

// @desc    Get all students for a class
// @route   GET /api/classes/:id/students
// @access  Private
export const getStudentsForClass = async (req, res) => {
    try {
        const classId = req.params.id;
        const classData = await Class.findById(classId).populate('students', 'firstName lastName');

        if (!classData) {
            return res.status(404).json({ message: 'Clase no encontrada.' });
        }

        // Mapear los estudiantes para devolver el formato esperado por el frontend
        const students = classData.students.map(student => ({
            _id: student._id,
            name: `${student.firstName} ${student.lastName}`
        }));

        res.status(200).json(students);
    } catch (error) {
        console.error('Error al obtener los alumnos:', error);
        res.status(500).json({ message: 'Error al obtener los alumnos.', error: error.message });
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

// @desc    Get dashboard statistics for a class
// @route   GET /api/classes/:id/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        const { id } = req.params;
        const classItem = await Class.findOne({ _id: id, user: req.user.id }).populate('students');

        if (!classItem) {
            return res.status(404).json({ success: false, message: 'Class not found or user not authorized' });
        }

        // 1. Top 3 estudiantes con más ausencias
        const attendances = await Attendance.find({ classId: id });
        const absenceCounts = {};

        attendances.forEach(attendance => {
            attendance.records.forEach(record => {
                if (record.status === 'absent') {
                    const studentId = record.studentId.toString();
                    absenceCounts[studentId] = (absenceCounts[studentId] || 0) + 1;
                }
            });
        });

        const sortedAbsences = Object.entries(absenceCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        const topAbsences = await Promise.all(sortedAbsences.map(async ([studentId, count]) => {
            const student = await User.findById(studentId);
            return { name: student ? `${student.firstName} ${student.lastName}` : 'Unknown', absenceCount: count };
        }));

        // 2. Promedio de notas del curso
        const assessments = await Assessment.find({ course: id });
        const assessmentIds = assessments.map(a => a._id);
        
        const grades = await Grade.find({ assessment: { $in: assessmentIds } });
        const averageGrade = grades.length > 0
            ? grades.reduce((acc, grade) => acc + grade.grade, 0) / grades.length
            : 0;

        res.status(200).json({
            success: true,
            topAbsences,
            averageGrade
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: error.message });
    }
};