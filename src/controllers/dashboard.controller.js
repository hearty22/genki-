import { instModel, studentModel, usersModel, subjectModel, eventModel, careerModel, courseModel, userInstitutionModel } from "../models/index.model.js";
import { Op} from "sequelize";
import sequelize from "sequelize";
// ✅ Obtener estadísticas generales del dashboard
export const getDashboardStats = async (req, res) => {
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
                    message: 'No tienes permisos para ver las estadísticas de esta institución'
                });
            }
        }

        // Obtener estadísticas básicas
        const stats = {};

        // 1. Número de estudiantes activos
        stats.studentsCount = await studentModel.count({
            where: {
                inst_id: institutionId,
                status: 'active'
            }
        });

        // 2. Número de docentes activos (usuarios con materias asignadas)
        // Consulta más simple sin campos is_active que pueden no existir
        const teachersWithSubjects = await subjectModel.findAll({
            where: {
                is_active: true
            },
            include: [{
                model: courseModel,
                required: true,
                include: [{
                    model: careerModel,
                    where: { inst_id: institutionId, is_active: true },
                    required: true
                }]
            }],
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('teaching_user_id')), 'teacherId']],
            raw: true
        });

        stats.teachersCount = teachersWithSubjects.length;

        // 3. Número de eventos próximos (próximos 30 días)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        stats.eventsCount = await eventModel.count({
            where: {
                inst_id: institutionId,
                start_date: {
                    [Op.gte]: new Date(),
                    [Op.lte]: thirtyDaysFromNow
                }
            }
        });

        // 4. Número de carreras activas
        stats.careersCount = await careerModel.count({
            where: {
                inst_id: institutionId,
                is_active: true
            }
        });

        // 5. Número de cursos activos (simplificado)
        stats.coursesCount = await courseModel.count({
            include: [{
                model: careerModel,
                where: { inst_id: institutionId, is_active: true },
                required: true
            }]
        });

        // 6. Número de materias activas (simplificado)
        stats.subjectsCount = await subjectModel.count({
            where: {
                is_active: true
            },
            include: [{
                model: courseModel,
                required: true,
                include: [{
                    model: careerModel,
                    where: { inst_id: institutionId, is_active: true },
                    required: true
                }]
            }]
        });

        // 7. Eventos recientes (últimos 5 eventos)
        stats.recentEvents = await eventModel.findAll({
            where: {
                inst_id: institutionId
            },
            include: [{
                model: usersModel,
                as: 'creator',
                attributes: ['id', 'user_name']
            }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // 8. Actividad reciente (últimos 10 cambios)
        stats.recentActivity = [];

        // Agregar estudiantes recientes
        const recentStudents = await studentModel.findAll({
            where: {
                inst_id: institutionId
            },
            include: [{
                model: usersModel,
                as: 'user',
                attributes: ['id', 'user_name']
            }],
            order: [['createdAt', 'DESC']],
            limit: 3
        });

        recentStudents.forEach(student => {
            stats.recentActivity.push({
                type: 'student_added',
                message: `Nuevo estudiante: ${student.user.user_name}`,
                date: student.createdAt,
                icon: 'fas fa-user-plus'
            });
        });

        // Agregar eventos recientes
        const recentEventsActivity = await eventModel.findAll({
            where: {
                inst_id: institutionId
            },
            include: [{
                model: usersModel,
                as: 'creator',
                attributes: ['id', 'user_name']
            }],
            order: [['createdAt', 'DESC']],
            limit: 3
        });

        recentEventsActivity.forEach(event => {
            stats.recentActivity.push({
                type: 'event_created',
                message: `Nuevo evento: ${event.title}`,
                date: event.createdAt,
                icon: 'fas fa-calendar-plus'
            });
        });

        // Ordenar actividad por fecha
        stats.recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            success: true,
            stats: stats
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener las estadísticas"});
    }
};

// ✅ Obtener estadísticas académicas detalladas
export const getAcademicStats = async (req, res) => {
    try {
        const institutionId = req.params.id;
        const userId = req.user.id;

        // Verificar permisos básicos
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
                    message: 'No tienes permisos para ver las estadísticas académicas'
                });
            }
        }

        const academicStats = {};

        // Estadísticas por carrera
        academicStats.careerStats = await careerModel.findAll({
            where: {
                inst_id: institutionId,
                is_active: true
            },
            attributes: [
                'id',
                'name',
                [sequelize.fn('COUNT', sequelize.fn('DISTINCT',
                    sequelize.fn('CONCAT', 'students.career_id', '-', 'students.id')
                )), 'studentsCount']
            ],
            include: [{
                model: studentModel,
                as: 'students',
                attributes: [],
                where: { status: 'active' },
                required: false
            }],
            group: ['careers.id', 'careers.name'],
            raw: true
        });

        // Estadísticas por semestre
        academicStats.semesterStats = await studentModel.findAll({
            where: {
                inst_id: institutionId,
                status: 'active'
            },
            attributes: [
                'semester',
                [sequelize.fn('COUNT', sequelize.col('id')), 'studentsCount']
            ],
            group: ['semester'],
            order: [['semester', 'ASC']],
            raw: true
        });

        // Estadísticas de materias por profesor (simplificada)
        academicStats.teacherStats = await usersModel.findAll({
            where: { role: 'user' },
            attributes: [
                'id',
                'user_name',
                [sequelize.fn('COUNT', sequelize.col('taughtSubjects.id')), 'subjectsCount']
            ],
            include: [{
                model: subjectModel,
                as: 'taughtSubjects',
                attributes: [],
                where: { is_active: true },
                required: false,
                include: [{
                    model: courseModel,
                    required: true,
                    include: [{
                        model: careerModel,
                        where: { inst_id: institutionId, is_active: true },
                        required: true
                    }]
                }]
            }],
            group: ['users.id', 'users.user_name'],
            having: sequelize.where(sequelize.fn('COUNT', sequelize.col('taughtSubjects.id')), '>', 0),
            order: [[sequelize.fn('COUNT', sequelize.col('taughtSubjects.id')), 'DESC']],
            raw: true,
            limit: 10
        });

        res.status(200).json({
            success: true,
            academicStats: academicStats
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener las estadísticas académicas"});
    }
};
