import { studentModel, usersModel, instModel, careerModel, userInstitutionModel } from "../models/index.model.js";

// ✅ Crear un nuevo estudiante
export const createStudent = async (req, res) => {
    try {
        const { user_id, career_id, semester } = req.body;
        const userId = req.user.id;
        const institutionId = req.params.id;

        // Verificar que el usuario tenga permisos sobre la institución
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden crear estudiantes'
            });
        }

        // Verificar que la institución existe
        const institution = await instModel.findOne({
            where: { id: institutionId, is_active: true }
        });

        if (!institution) {
            return res.status(404).json({
                success: false,
                message: 'Institución no encontrada'
            });
        }

        // Verificar que el usuario existe
        const user = await usersModel.findOne({
            where: { id: user_id, role: 'user' }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar que la carrera existe y pertenece a la institución (si se especifica)
        if (career_id) {
            const career = await careerModel.findOne({
                where: { id: career_id, inst_id: institutionId, is_active: true }
            });

            if (!career) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrera no encontrada o no pertenece a esta institución'
                });
            }
        }

        // Verificar si el usuario ya es estudiante en esta institución
        const existingStudent = await studentModel.findOne({
            where: {
                user_id: user_id,
                inst_id: institutionId
            }
        });

        if (existingStudent) {
            if (existingStudent.status === 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'El usuario ya es estudiante activo en esta institución'
                });
            } else {
                // Reactivar estudiante
                await existingStudent.update({
                    career_id,
                    semester,
                    status: 'active'
                });

                return res.status(200).json({
                    success: true,
                    message: 'Estudiante reactivado exitosamente',
                    student: existingStudent
                });
            }
        }

        const newStudent = await studentModel.create({
            user_id,
            inst_id: institutionId,
            career_id,
            semester,
            status: 'active'
        });

        res.status(201).json({
            success: true,
            message: 'Estudiante creado exitosamente',
            student: {
                id: newStudent.id,
                user_id: newStudent.user_id,
                inst_id: newStudent.inst_id,
                career_id: newStudent.career_id,
                semester: newStudent.semester,
                status: newStudent.status
            }
        });

    } catch (error) {
        console.log(error);
        if (error.errors) {
            return res.status(400).json({
                message: "Errores de validación",
                errors: error.errors
            });
        }
        res.status(500).json({error: "Error interno al crear el estudiante"});
    }
};

// ✅ Obtener estudiantes de una institución
export const getInstitutionStudents = async (req, res) => {
    try {
        const institutionId = req.params.id;
        const userId = req.user.id;

        // Verificar que la institución existe
        const institution = await instModel.findOne({
            where: { id: institutionId, is_active: true }
        });

        if (!institution) {
            return res.status(404).json({
                success: false,
                message: 'Institución no encontrada'
            });
        }

        // Verificar permisos
        if (req.user.role !== 'admin') {
            const hasPermission = await userInstitutionModel.findOne({
                where: {
                    user_id: userId,
                    inst_id: institutionId,
                    is_active: true
                }
            });

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver los estudiantes de esta institución'
                });
            }
        }

        const students = await studentModel.findAll({
            where: {
                inst_id: institutionId,
                status: 'active'
            },
            include: [{
                model: usersModel,
                as: 'user',
                attributes: ['id', 'user_name', 'email', 'profile_photo_path']
            }, {
                model: careerModel,
                as: 'career',
                attributes: ['id', 'name'],
                required: false
            }],
            order: [['user', 'user_name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            students: students
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener los estudiantes"});
    }
};

// ✅ Obtener un estudiante específico
export const getStudentById = async (req, res) => {
    try {
        const studentId = req.params.id;
        const userId = req.user.id;

        const student = await studentModel.findOne({
            where: { id: studentId, status: 'active' },
            include: [{
                model: usersModel,
                as: 'user',
                attributes: ['id', 'user_name', 'email', 'profile_photo_path']
            }, {
                model: careerModel,
                as: 'career',
                attributes: ['id', 'name'],
                required: false
            }, {
                model: instModel,
                as: 'institucione',
                attributes: ['id', 'name'],
                required: true
            }]
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Verificar permisos
        if (req.user.role !== 'admin') {
            const hasPermission = await userInstitutionModel.findOne({
                where: {
                    user_id: userId,
                    inst_id: student.inst_id,
                    is_active: true
                }
            });

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver este estudiante'
                });
            }
        }

        res.status(200).json({
            success: true,
            student: student
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener el estudiante"});
    }
};

// ✅ Actualizar estudiante
export const updateStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { career_id, semester, status } = req.body;
        const userId = req.user.id;

        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden actualizar estudiantes'
            });
        }

        const student = await studentModel.findOne({
            where: { id: studentId, status: 'active' }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        // Verificar carrera si se especifica
        if (career_id) {
            const career = await careerModel.findOne({
                where: { id: career_id, inst_id: student.inst_id, is_active: true }
            });

            if (!career) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrera no encontrada o no pertenece a esta institución'
                });
            }
        }

        const [updatedRowsCount, updatedRows] = await studentModel.update(
            { career_id, semester, status },
            {
                where: { id: studentId },
                returning: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Estudiante actualizado exitosamente',
            student: updatedRows[0]
        });

    } catch (error) {
        console.log(error);
        if (error.errors) {
            return res.status(400).json({
                message: "Errores de validación",
                errors: error.errors
            });
        }
        res.status(500).json({error: "Error interno al actualizar el estudiante"});
    }
};

// ✅ Cambiar estado de estudiante
export const changeStudentStatus = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { status } = req.body;
        const userId = req.user.id;

        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden cambiar el estado de estudiantes'
            });
        }

        const student = await studentModel.findOne({
            where: { id: studentId }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        await studentModel.update(
            { status },
            { where: { id: studentId } }
        );

        res.status(200).json({
            success: true,
            message: 'Estado del estudiante actualizado exitosamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al cambiar el estado del estudiante"});
    }
};
