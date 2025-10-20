import { body } from 'express-validator';

// Validaciones para el registro de usuario
export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios')
];

// Validaciones para el login
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
];

// Validaciones para actualizar perfil
export const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .toLowerCase()
];

// Validaciones para cambio de contraseña
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es obligatoria'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];