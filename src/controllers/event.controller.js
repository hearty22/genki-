import { eventModel, instModel, usersModel, userInstitutionModel } from "../models/index.model.js";

// ✅ Crear un nuevo evento
export const createEvent = async (req, res) => {
    try {
        const { title, description, start_date, end_date, location, event_type, is_public, color } = req.body;
        const userId = req.user.id;
        const institutionId = req.params.id;

        // Verificar permisos
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden crear eventos'
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

        const newEvent = await eventModel.create({
            inst_id: institutionId,
            title,
            description,
            start_date,
            end_date,
            location,
            event_type,
            created_by: userId,
            is_public,
            color
        });

        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente',
            event: {
                id: newEvent.id,
                title: newEvent.title,
                description: newEvent.description,
                start_date: newEvent.start_date,
                end_date: newEvent.end_date,
                location: newEvent.location,
                event_type: newEvent.event_type,
                is_public: newEvent.is_public,
                color: newEvent.color
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
        res.status(500).json({error: "Error interno al crear el evento"});
    }
};

// ✅ Obtener eventos de una institución
export const getInstitutionEvents = async (req, res) => {
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
                    message: 'No tienes permisos para ver los eventos de esta institución'
                });
            }
        }

        const events = await eventModel.findAll({
            where: {
                inst_id: institutionId,
                ...(req.user.role !== 'admin' && { is_public: true })
            },
            include: [{
                model: usersModel,
                as: 'creator',
                attributes: ['id', 'user_name']
            }],
            order: [['start_date', 'ASC']]
        });

        res.status(200).json({
            success: true,
            events: events
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener los eventos"});
    }
};

// ✅ Obtener un evento específico
export const getEventById = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        const event = await eventModel.findOne({
            where: { id: eventId },
            include: [{
                model: instModel,
                as: 'institution',
                attributes: ['id', 'name']
            }, {
                model: usersModel,
                as: 'creator',
                attributes: ['id', 'user_name']
            }]
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        // Verificar permisos
        if (req.user.role !== 'admin' && !event.is_public) {
            const hasPermission = await userInstitutionModel.findOne({
                where: {
                    user_id: userId,
                    inst_id: event.inst_id,
                    is_active: true
                }
            });

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver este evento'
                });
            }
        }

        res.status(200).json({
            success: true,
            event: event
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al obtener el evento"});
    }
};

// ✅ Actualizar evento
export const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const { title, description, start_date, end_date, location, event_type, is_public, color } = req.body;
        const userId = req.user.id;

        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden actualizar eventos'
            });
        }

        const event = await eventModel.findOne({
            where: { id: eventId }
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        const [updatedRowsCount, updatedRows] = await eventModel.update(
            { title, description, start_date, end_date, location, event_type, is_public, color },
            {
                where: { id: eventId },
                returning: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Evento actualizado exitosamente',
            event: updatedRows[0]
        });

    } catch (error) {
        console.log(error);
        if (error.errors) {
            return res.status(400).json({
                message: "Errores de validación",
                errors: error.errors
            });
        }
        res.status(500).json({error: "Error interno al actualizar el evento"});
    }
};

// ✅ Eliminar evento
export const deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden eliminar eventos'
            });
        }

        const event = await eventModel.findOne({
            where: { id: eventId }
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        await eventModel.destroy({
            where: { id: eventId }
        });

        res.status(200).json({
            success: true,
            message: 'Evento eliminado exitosamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno al eliminar el evento"});
    }
};
