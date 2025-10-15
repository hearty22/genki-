import { careerModel, instModel, userInstitutionModel } from "../models/index.model.js";
import { Op } from "sequelize";

// ✅ Crear una nueva carrera
export const createCareer = async (req, res) => {
    try {
        const { name, career_long, inst_id } = req.body;
        const userId = req.user.id;

        // Verificar que el usuario tenga permisos sobre la institución
        //comentado ya que se manejara por middleware
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Solo los administradores pueden crear carreras'
        //     });
        // }

        // Verificar que la institución pertenece al usuario
        const userInstitution = await instModel.findOne({
            where: { id: inst_id, is_active: true }
        });

        if (!userInstitution) {
            return res.status(404).json({
                success: false,
                message: 'Institución no encontrada'
            });
        }

        const newCareer = await careerModel.create({
            inst_id,
            name,
            career_long,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'Carrera creada exitosamente',
            career: {
                id: newCareer.id,
                name: newCareer.name,
                career_long: newCareer.career_long,
                inst_id: newCareer.inst_id,
                is_active: newCareer.is_active
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
        res.status(500).json({error: "Error interno al crear la carrera"});
    }
};

// ✅ Obtener todas las carreras de una institución
export const getInstitutionCareers = async (req, res) => {
    try {
        const institutionId = req.params.id;
        const userId = req.user.id;

        // Verificar permisos
        const userInstitution = await instModel.findOne({
            where: { id: institutionId, is_active: true }
        });

        if (!userInstitution) {
            return res.status(404).json({
                success: false,
                message: 'Institución no encontrada'
            });
        }

        // Si no es admin, verificar que tiene relación con la institución
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
                    message: 'No tienes permisos para ver las carreras de esta institución'
                });
            }
        }

        const careers = await careerModel.findAll({
            where: {
                inst_id: institutionId,
                is_active: true
            },
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            careers: careers
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener las carreras"});
    }
};

// ✅ Obtener una carrera específica
export const getCareerById = async (req, res) => {
    try {
        const careerId = req.params.id;
        const userId = req.user.id;

        const career = await careerModel.findOne({
            where: { id: careerId, is_active: true },
            include: [{
                model: instModel,
                as: 'institucione',
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
                    inst_id: career.inst_id,
                    is_active: true
                }
            });

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver esta carrera'
                });
            }
        }

        res.status(200).json({
            success: true,
            career: career
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener la carrera"});
    }
};

// ✅ Actualizar carrera
export const updateCareer = async (req, res) => {
    try {
        const careerId = req.params.id;
        const { name, career_long } = req.body;
        const userId = req.user.id;

        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden actualizar carreras'
            });
        }

        const career = await careerModel.findOne({
            where: { id: careerId, is_active: true }
        });

        if (!career) {
            return res.status(404).json({
                success: false,
                message: 'Carrera no encontrada'
            });
        }

        const [updatedRowsCount, updatedRows] = await careerModel.update(
            { name, career_long },
            {
                where: { id: careerId },
                returning: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Carrera actualizada exitosamente',
            career: updatedRows[0]
        });

    } catch (error) {
        console.log(error);
        if (error.errors) {
            return res.status(400).json({
                message: "Errores de validación",
                errors: error.errors
            });
        }
        res.status(500).json({error: "Error interno al actualizar la carrera"});
    }
};

// ✅ Eliminar carrera (desactivar)
export const deleteCareer = async (req, res) => {
    try {
        const careerId = req.params.id;
        const userId = req.user.id;

        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden eliminar carreras'
            });
        }

        const career = await careerModel.findOne({
            where: { id: careerId, is_active: true }
        });

        if (!career) {
            return res.status(404).json({
                success: false,
                message: 'Carrera no encontrada'
            });
        }

        await careerModel.update(
            { is_active: false },
            { where: { id: careerId } }
        );

        res.status(200).json({
            success: true,
            message: 'Carrera eliminada exitosamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al eliminar la carrera"});
    }
};
