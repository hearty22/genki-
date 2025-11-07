import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware para verificar token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    console.log('authenticateToken middleware triggered');
    let token = req.signedCookies.authToken;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7, authHeader.length);
      }
    }

    if (!token) {
      console.log('No token found in headers or cookies');
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar el token
    const secret = process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : '';
    const decoded = jwt.verify(token, secret);
    console.log('Token decoded:', decoded);
    
    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('User not found for decoded token');
      return res.status(401).json({
        success: false,
        message: 'Token inválido - usuario no encontrado'
      });
    }

    if (!user.isActive) {
      console.log('User account is inactive');
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }

    // Agregar el usuario a la request
    req.user = user;
    console.log('Authentication successful, user set in request');
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.log('Invalid token error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.log('Token expired error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar roles específicos
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

// Función para generar token JWT
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'genki-docente-app'
    }
  );
};

// Función para generar refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: '30d',
      issuer: 'genki-docente-app'
    }
  );
};