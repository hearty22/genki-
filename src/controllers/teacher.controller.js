import { usersModel, instModel, subjectModel, userInstitutionModel, courseModel } from "../models/index.model.js";

// ✅ Crear un nuevo docente
export const createTeacher = async (req, res) => {
    try {
        const { user_id } = req.body;
        const userId = req.user.id;
        const institutionId = req.params.id;

        // Verificar que el usuario tenga permisos sobre la institución
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden crear docentes'
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

        // Verificar que el usuario existe y es usuario normal (no admin)
        const user = await usersModel.findOne({
            where: { id: user_id, role: 'user' }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si el usuario ya está asociado como docente en esta institución
        const existingAssociation = await userInstitutionModel.findOne({
            where: {
                user_id: user_id,
                inst_id: institutionId,
                is_active: true
            }
        });

        if (existingAssociation) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya está asociado a esta institución'
            });
        }

        // Crear asociación como docente
        await userInstitutionModel.create({
            user_id,
            inst_id: institutionId,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'Docente creado exitosamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al crear el docente"});
    }
};

// ✅ Obtener docentes de una institución
export const getInstitutionTeachers = async (req, res) => {
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
                    message: 'No tienes permisos para ver los docentes de esta institución'
                });
            }
        }

        // Obtener docentes (usuarios con materias asignadas)
        const teachers = await userInstitutionModel.findAll({
            where: {
                inst_id: institutionId,
                is_active: true
            },
            include: [{
                model: usersModel,
                as: 'user',
                attributes: ['id', 'user_name', 'email', 'profile_photo_path'],
                where: { role: 'user' }
            }, {
                model: subjectModel,
                as: 'taughtSubjects',
                attributes: ['id', 'name'],
                required: false,
                where: { is_active: true }
            }],
            attributes: []
        });

        // Filtrar usuarios que realmente tienen materias asignadas
        const teachersWithSubjects = teachers.filter(t => t.taughtSubjects && t.taughtSubjects.length > 0);

        res.status(200).json({
            success: true,
            teachers: teachersWithSubjects.map(t => t.user)
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener los docentes"});
    }
};

// ✅ Obtener materias de un docente
export const getTeacherSubjects = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const userId = req.user.id;

        // Verificar que el docente existe
        const teacher = await usersModel.findOne({
            where: { id: teacherId, role: 'user' }
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Docente no encontrado'
            });
        }

        // Obtener materias asignadas al docente
        const subjects = await subjectModel.findAll({
            where: {
                teaching_user_id: teacherId,
                is_active: true
            },
            include: [{
                model: courseModel,
                as: 'course',
                attributes: ['id', 'year', 'description']
            }],
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            subjects: subjects
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener las materias del docente"});
    }
};
