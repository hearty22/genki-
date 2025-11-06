import express from 'express';
import { register, login, getProfile, updateProfile, logout, uploadProfileImage, updateProfileImageUrl, removeProfileImage } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { hashPassword } from '../middleware/hashPassword.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import passport from 'passport';

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

// Ruta para actualizar perfil del usuario autenticado
// PUT /api/auth/profile
router.put('/profile', 
  authenticateToken,    // Verificar token JWT
  updateProfile         // Controlador de actualización de perfil
);

// Ruta para logout de usuario
// POST /api/auth/logout
router.post('/logout', authenticateToken, logout);

// Rutas para manejo de imagen de perfil

// Subir imagen de perfil por archivo
// POST /api/auth/profile/image/upload
router.post('/profile/image/upload',
  authenticateToken,    // Verificar token JWT
  upload.single('profileImage'), // Middleware de multer para un solo archivo
  uploadProfileImage    // Controlador de carga de imagen
);

// Actualizar imagen de perfil por URL
// PUT /api/auth/profile/image/url
router.put('/profile/image/url',
  authenticateToken,    // Verificar token JWT
  updateProfileImageUrl // Controlador de actualización por URL
);

// Eliminar imagen de perfil
// DELETE /api/auth/profile/image
router.delete('/profile/image',
  authenticateToken,    // Verificar token JWT
  removeProfileImage    // Controlador de eliminación de imagen
);

// Rutas de autenticación con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    // Generar token JWT
    const token = generateToken(req.user._id);
    console.log('Generated token in /google/callback:', token);

    // Guardar el token en una cookie
    res.cookie('authToken', token, { 
      secure: process.env.NODE_ENV === 'production', // Solo enviar en HTTPS en producción
      signed: true, // Firmar la cookie para mayor seguridad
      path: '/' // Asegurar que la cookie esté disponible en todo el sitio
    });

    // Redirigir al dashboard
    res.redirect('/dashboard.html');
  }
);

// Rutas de autenticación con Microsoft
router.get('/microsoft', passport.authenticate('microsoft'));

router.get('/microsoft/callback', 
 
  (req, res) => {
    res.redirect('/dashboard.html');
  }
);

export default router;