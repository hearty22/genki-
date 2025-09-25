import { body } from "express-validator";
import { usersModel } from "../models/users.model.js";

export const loginUserValidator = [
    body('email')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .notEmpty().withMessage('El email es requerido'),

    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 1 }).withMessage('La contraseña no puede estar vacía')
];

export const createUserValidator = [
    // Validación del username (user_name en el body del request)
    body('user_name')
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('El username debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_.]+$/).withMessage('El username solo puede contener letras, números, puntos y guiones bajos')
        .notEmpty().withMessage('El username es requerido')
        .custom(async (value) => {
            const existingUser = await usersModel.findOne({ where: { user_name: value } });
            if (existingUser) {
                throw new Error('El username ya está en uso');
            }
            return true;
        }),

    // Validación del email
    body('email')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail().withMessage('Email inválido')
        .notEmpty().withMessage('El email es requerido')
        .custom(async (value) => {
            const existingUser = await usersModel.findOne({ where: { email: value } });
            if (existingUser) {
                throw new Error('El email ya está registrado');
            }
            return true;
        }),

    // Validación del password
    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage('La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial')
        .notEmpty().withMessage('La contraseña es requerida'),

    // Validación del gender
    body('gender')
        .isIn(['masculino', 'femenino', 'otro']).withMessage('El género debe ser masculino, femenino u otro')
        .notEmpty().withMessage('El género es requerido')
];