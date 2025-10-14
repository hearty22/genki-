import { courseModel, careerModel, instModel, userInstitutionModel } from "../models/index.model.js";

// ✅ Crear un nuevo curso
export const createCourse = async (req, res) => {
    try {
        const { year, description, career_id } = req.body;
        const userId = req.user.id;

        // Verificar que el usuario tenga permisos sobre la institución
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden crear cursos'
            });
        }

        // Verificar que la carrera existe y pertenece a una institución activa
        const career = await careerModel.findOne({
            where: { id: career_id, is_active: true },
            include: [{
                model: instModel,
                where: { is_active: true },
                required: true
            }]
        });

        if (!career) {
            return res.status(404).json({
                success: false,
                message: 'Carrera no encontrada o inactiva'
            });
        }

        const newCourse = await courseModel.create({
            career_id,
            year,
            description,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'Curso creado exitosamente',
            course: {
                id: newCourse.id,
                year: newCourse.year,
                description: newCourse.description,
                career_id: newCourse.career_id,
                is_active: newCourse.is_active
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
        res.status(500).json({error: "Error interno al crear el curso"});
    }
};

// ✅ Obtener cursos de una carrera
export const getCareerCourses = async (req, res) => {
    try {
        const careerId = req.params.id;
        const userId = req.user.id;

        // Verificar que la carrera existe
        const career = await careerModel.findOne({
            where: { id: careerId, is_active: true },
            include: [{
                model: instModel,
                where: { is_active: true },
                required: true
            }]
        });

        if (!career) {
            return res.status(404).json({
                success: false,
                message: 'Carrera no encontrada'
            });
        }

        // Verificar permisos
        if (req.user.role !== 'admin') {
            const hasPermission = await userInstitutionModel.findOne({
                where: {
                    user_id: userId,
                    inst_id: career.institucione.id,
                    is_active: true
                }
            });

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver los cursos de esta carrera'
                });
            }
        }

        const courses = await courseModel.findAll({
            where: {
                career_id: careerId,
                is_active: true
            },
            order: [['year', 'ASC']]
        });

        res.status(200).json({
            success: true,
            courses: courses
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener los cursos"});
    }
};

// ✅ Obtener un curso específico
export const getCourseById = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;

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
                    message: 'No tienes permisos para ver este curso'
                });
            }
        }

        res.status(200).json({
            success: true,
            course: course
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener el curso"});
    }
};

// ✅ Actualizar curso
export const updateCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const { year, description } = req.body;
        const userId = req.user.id;

        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden actualizar cursos'
            });
        }

        const course = await courseModel.findOne({
            where: { id: courseId, is_active: true }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        const [updatedRowsCount, updatedRows] = await courseModel.update(
            { year, description },
            {
                where: { id: courseId },
                returning: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Curso actualizado exitosamente',
            course: updatedRows[0]
        });

    } catch (error) {
        console.log(error);
        if (error.errors) {
            return res.status(400).json({
                message: "Errores de validación",
                errors: error.errors
            });
        }
        res.status(500).json({error: "Error interno al actualizar el curso"});
    }
};

// ✅ Eliminar curso (desactivar)
export const deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;

        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden eliminar cursos'
            });
        }

        const course = await courseModel.findOne({
            where: { id: courseId, is_active: true }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        await courseModel.update(
            { is_active: false },
            { where: { id: courseId } }
        );

        res.status(200).json({
            success: true,
            message: 'Curso eliminado exitosamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al eliminar el curso"});
    }
};
