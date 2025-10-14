import { subjectModel, courseModel, careerModel, instModel, usersModel, userInstitutionModel } from "../models/index.model.js";

// ✅ Crear una nueva materia
export const createSubject = async (req, res) => {
    try {
        const { name, description, credits, course_id, teaching_user_id } = req.body;
        const userId = req.user.id;

        // Verificar que el usuario tenga permisos sobre la institución
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden crear materias'
            });
        }

        // Verificar que el curso existe y pertenece a una institución activa
        const course = await courseModel.findOne({
            where: { id: course_id, is_active: true },
            include: [{
                model: careerModel,
                where: { is_active: true },
                required: true,
                include: [{
                    model: instModel,
                    where: { is_active: true },
                    required: true
                }]
            }]
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado o inactivo'
            });
        }

        // Verificar que el profesor existe y está activo (si se especifica)
        if (teaching_user_id) {
            const teacher = await usersModel.findOne({
                where: { id: teaching_user_id, role: 'user' }
            });

            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: 'Profesor no encontrado'
                });
            }
        }

        const newSubject = await subjectModel.create({
            course_id,
            teaching_user_id,
            name,
            description,
            credits,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'Materia creada exitosamente',
            subject: {
                id: newSubject.id,
                name: newSubject.name,
                description: newSubject.description,
                credits: newSubject.credits,
                course_id: newSubject.course_id,
                teaching_user_id: newSubject.teaching_user_id,
                is_active: newSubject.is_active
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
        res.status(500).json({error: "Error interno al crear la materia"});
    }
};

// ✅ Obtener materias de un curso
export const getCourseSubjects = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;

        // Verificar que el curso existe
        const course = await courseModel.findOne({
            where: { id: courseId, is_active: true },
            include: [{
                model: careerModel,
                where: { is_active: true },
                required: true,
                include: [{
                    model: instModel,
                    where: { is_active: true },
                    required: true
                }]
            }]
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        // Verificar permisos
        if (req.user.role !== 'admin') {
            const hasPermission = await userInstitutionModel.findOne({
                where: {
                    user_id: userId,
                    inst_id: course.career.institucione.id,
                    is_active: true
                }
            });

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver las materias de este curso'
                });
            }
        }

        const subjects = await subjectModel.findAll({
            where: {
                course_id: courseId,
                is_active: true
            },
            include: [{
                model: usersModel,
                as: 'teacher',
                attributes: ['id', 'user_name', 'email'],
                required: false
            }],
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            subjects: subjects
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener las materias"});
    }
};

// ✅ Obtener una materia específica
export const getSubjectById = async (req, res) => {
    try {
        const subjectId = req.params.id;
        const userId = req.user.id;

        const subject = await subjectModel.findOne({
            where: { id: subjectId, is_active: true },
            include: [{
                model: courseModel,
                where: { is_active: true },
                required: true,
                include: [{
                    model: careerModel,
                    where: { is_active: true },
                    required: true,
                    include: [{
                        model: instModel,
                        where: { is_active: true },
                        required: true
                    }]
                }]
            }, {
                model: usersModel,
                as: 'teacher',
                attributes: ['id', 'user_name', 'email'],
                required: false
            }]
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Materia no encontrada'
            });
        }

        // Verificar permisos
        if (req.user.role !== 'admin') {
            const hasPermission = await userInstitutionModel.findOne({
                where: {
                    user_id: userId,
                    inst_id: subject.course.career.institucione.id,
                    is_active: true
                }
            });

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver esta materia'
                });
            }
        }

        res.status(200).json({
            success: true,
            subject: subject
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener la materia"});
    }
};

// ✅ Asignar profesor a materia
export const assignTeacherToSubject = async (req, res) => {
    try {
        const subjectId = req.params.id;
        const { teaching_user_id } = req.body;
        const userId = req.user.id;

        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden asignar profesores'
            });
        }

        // Verificar que la materia existe
        const subject = await subjectModel.findOne({
            where: { id: subjectId, is_active: true }
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Materia no encontrada'
            });
        }

        // Verificar que el profesor existe
        const teacher = await usersModel.findOne({
            where: { id: teaching_user_id, role: 'user' }
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Profesor no encontrado'
            });
        }

        await subjectModel.update(
            { teaching_user_id },
            { where: { id: subjectId } }
        );

        res.status(200).json({
            success: true,
            message: 'Profesor asignado exitosamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al asignar profesor"});
    }
};

// ✅ Actualizar materia
export const updateSubject = async (req, res) => {
    try {
        const subjectId = req.params.id;
        const { name, description, credits, teaching_user_id } = req.body;
        const userId = req.user.id;

        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden actualizar materias'
            });
        }

        const subject = await subjectModel.findOne({
            where: { id: subjectId, is_active: true }
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Materia no encontrada'
            });
        }

        // Verificar profesor si se especifica
        if (teaching_user_id) {
            const teacher = await usersModel.findOne({
                where: { id: teaching_user_id, role: 'user' }
            });

            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: 'Profesor no encontrado'
                });
            }
        }

        const [updatedRowsCount, updatedRows] = await subjectModel.update(
            { name, description, credits, teaching_user_id },
            {
                where: { id: subjectId },
                returning: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Materia actualizada exitosamente',
            subject: updatedRows[0]
        });

    } catch (error) {
        console.log(error);
        if (error.errors) {
            return res.status(400).json({
                message: "Errores de validación",
                errors: error.errors
            });
        }
        res.status(500).json({error: "Error interno al actualizar la materia"});
    }
};

// ✅ Eliminar materia (desactivar)
export const deleteSubject = async (req, res) => {
    try {
        const subjectId = req.params.id;
        const userId = req.user.id;

        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden eliminar materias'
            });
        }

        const subject = await subjectModel.findOne({
            where: { id: subjectId, is_active: true }
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Materia no encontrada'
            });
        }

        await subjectModel.update(
            { is_active: false },
            { where: { id: subjectId } }
        );

        res.status(200).json({
            success: true,
            message: 'Materia eliminada exitosamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al eliminar la materia"});
    }
};
