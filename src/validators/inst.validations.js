import { body } from "express-validator";
import { instModel } from "../models/inst.model.js";

export const createInstitutionValidator = [
    // Validación del nombre (requerido)
    body('name')
        .notEmpty().withMessage('El nombre de la institución es requerido')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ0-9\s\-.,()]+$/).withMessage('El nombre solo puede contener letras, números, espacios y los caracteres: -.,()')
        .custom(async (value, { req }) => {
            try {
                // Verificar si el usuario está autenticado desde cookies
                const token = req.cookies?.token;
                if (!token) {
                    throw new Error('Token de autenticación requerido');
                }

                // Usar jwt.verify directamente como en el middleware
                const jwt = (await import('jsonwebtoken')).default;
                const decodedToken = jwt.verify(token, process.env.JWT_SEC);
                const userId = decodedToken.id;

                // Verificar si ya existe una institución con ese nombre para este usuario
                const existingInstitution = await instModel.findOne({
                    where: {
                        name: value,
                        user_id: userId
                    }
                });

                if (existingInstitution) {
                    throw new Error('Ya tienes una institución con ese nombre');
                }

                return true;
            } catch (error) {
                if (error.message.includes('Token')) {
                    throw new Error('Debes estar autenticado para crear una institución');
                }
                throw error;
            }
        }),

    // Validación de las siglas (opcional)
    body('siglas')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20 }).withMessage('Las siglas deben tener entre 1 y 20 caracteres')
        .matches(/^[A-Z0-9]+$/).withMessage('Las siglas solo pueden contener letras mayúsculas y números'),

    // Validación de la dirección (opcional)
    body('address')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 }).withMessage('La dirección debe tener entre 5 y 200 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ0-9\s\-.,()#]+$/).withMessage('La dirección contiene caracteres no válidos'),

    // Validación del nivel (opcional)
    body('nivel')
        .optional()
        .isIn(['Inicial', 'Primaria', 'Secundaria', 'Terciaria', 'Universitaria', 'Otro']).withMessage('El nivel debe ser: Inicial, Primaria, Secundaria, Terciaria, Universitaria u Otro'),

    // Validación de las notas (opcional)
    body('notas')
        .optional()
        .trim()
        .isLength({ min: 1, max: 500 }).withMessage('Las notas deben tener entre 1 y 500 caracteres')
];

export const updateInstitutionValidator = [
    // Validación del nombre (requerido)
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ0-9\s\-.,()]+$/).withMessage('El nombre solo puede contener letras, números, espacios y los caracteres: -.,()')
        .notEmpty().withMessage('El nombre de la institución es requerido')
        .custom(async (value, { req }) => {
            try {
                // Verificar si el usuario está autenticado desde cookies
                const token = req.cookies?.token;
                if (!token) {
                    throw new Error('Token de autenticación requerido');
                }

                // Usar jwt.verify directamente como en el middleware
                const jwt = (await import('jsonwebtoken')).default;
                const decodedToken = jwt.verify(token, process.env.JWT_SEC);
                const userId = decodedToken.id;
                const institutionId = req.params.id;

                // Verificar si ya existe una institución con ese nombre para este usuario (excluyendo la actual)
                const existingInstitution = await instModel.findOne({
                    where: {
                        name: value,
                        user_id: userId,
                        id_institucion: { [instModel.sequelize.Op.ne]: institutionId }
                    }
                });

                if (existingInstitution) {
                    throw new Error('Ya tienes otra institución con ese nombre');
                }

                return true;
            } catch (error) {
                if (error.message.includes('Token')) {
                    throw new Error('Debes estar autenticado para actualizar una institución');
                }
                throw error;
            }
        }),

    // Validación de las siglas (opcional)
    body('siglas')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20 }).withMessage('Las siglas deben tener entre 1 y 20 caracteres')
        .matches(/^[A-Z0-9]+$/).withMessage('Las siglas solo pueden contener letras mayúsculas y números'),

    // Validación de la dirección (opcional)
    body('address')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 }).withMessage('La dirección debe tener entre 5 y 200 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ0-9\s\-.,()#]+$/).withMessage('La dirección contiene caracteres no válidos'),

    // Validación del nivel (opcional)
    body('nivel')
        .optional()
        .isIn(['Inicial', 'Primaria', 'Secundaria', 'Terciaria', 'Universitaria', 'Otro']).withMessage('El nivel debe ser: Inicial, Primaria, Secundaria, Terciaria, Universitaria u Otro'),

    // Validación de las notas (opcional)
    body('notas')
        .optional()
        .trim()
        .isLength({ min: 1, max: 500 }).withMessage('Las notas deben tener entre 1 y 500 caracteres')
];

export const searchInstitutionsValidator = [
    body('query')
        .trim()
        .isLength({ min: 1, max: 50 }).withMessage('El término de búsqueda debe tener entre 1 y 50 caracteres')
        .notEmpty().withMessage('El término de búsqueda es requerido')
];