import express from 'express';
import { register, login, getProfile, logout } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { hashPassword } from '../middleware/hashPassword.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Ruta para registro de usuario
// POST /api/auth/register
router.post('/register', 
  validateRegister,     // Validar datos de entrada
  hashPassword,         // Hashear contraseña
  register              // Controlador de registro
);

// Ruta para login de usuario
// POST /api/auth/login
router.post('/login', 
  validateLogin,        // Validar datos de entrada
  login                 // Controlador de login
);

// Ruta para obtener perfil del usuario autenticado
// GET /api/auth/profile
router.get('/profile', 
  authenticateToken,    // Verificar token JWT
  getProfile            // Controlador de perfil
);

// Ruta para logout
// POST /api/auth/logout
router.post('/logout', 
  authenticateToken,    // Verificar token JWT
  logout                // Controlador de logout
);

export default router;