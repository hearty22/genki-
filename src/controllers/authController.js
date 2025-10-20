import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../middleware/auth.js';
import { comparePassword } from '../middleware/hashPassword.js';
import { validationResult } from 'express-validator';

// Registro de nuevo usuario
export const register = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { email, firstName, lastName, hashedPassword } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una cuenta con este email'
      });
    }

    // Crear nuevo usuario con la contraseña hasheada
    const newUser = new User({
      email,
      password: hashedPassword, // Usar la contraseña hasheada del middleware
      firstName,
      lastName,
      role: 'docente'
    });

    // Guardar usuario en la base de datos
    await newUser.save();

    // Generar tokens
    const token = generateToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // Configurar cookies para el token
    const cookieOptions = {
      httpOnly: false, // Permitir acceso desde JavaScript para compatibilidad
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    };

    // Establecer cookies
    res.cookie('authToken', token, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Respuesta exitosa (sin incluir la contraseña)
    const userResponse = newUser.toPublicJSON();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    
    // Manejar errores específicos de MongoDB
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar perfil del usuario autenticado
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, bio } = req.body;
    const userId = req.user._id;

    // Validar que el email no esté en uso por otro usuario
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso por otro usuario'
        });
      }
    }

    // Preparar datos para actualizar
    const updateData = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (bio !== undefined) updateData.bio = bio ? bio.trim() : null;

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: updatedUser.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Login de usuario
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email (incluyendo password para comparación)
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador.'
      });
    }

    // Verificar contraseña usando la función utilitaria
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Configurar cookies para el token
    const cookieOptions = {
      httpOnly: false, // Permitir acceso desde JavaScript para compatibilidad
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    };

    // Establecer cookies
    res.cookie('authToken', token, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Respuesta exitosa
    const userResponse = user.toPublicJSON();

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
  try {
    const user = req.user; // Viene del middleware de autenticación
    
    res.json({
      success: true,
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cerrar sesión
export const logout = async (req, res) => {
  try {
    // Limpiar cookies del navegador
    res.clearCookie('authToken', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.clearCookie('refreshToken', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // En una implementación más robusta, aquí se agregaría el token a una blacklist
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};