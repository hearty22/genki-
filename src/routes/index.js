import express from 'express';
import authRoutes from './authRoutes.js';
import classRoutes from './classRoutes.js'; // Import class routes
import assessmentRoutes from './assessmentRoutes.js'; // Import assessment routes
import reportRoutes from './reportRoutes.js'; // Import report routes
import eventRoutes from './eventRoutes.js'; // Import event routes
import userRoutes from './userRoutes.js'; // Import user routes
import attendanceRoutes from './attendanceRoutes.js'; // Import attendance routes
import gradeRoutes from './gradeRoutes.js'; // Import grade routes

const router = express.Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de clases
router.use('/classes', classRoutes); // Use class routes

// Rutas de evaluaciones
router.use('/assessments', assessmentRoutes); // Use assessment routes

// Rutas de reportes
router.use('/reports', reportRoutes); // Use report routes

// Rutas de eventos
router.use('/events', eventRoutes); // Use event routes

// Rutas de usuarios
router.use('/users', userRoutes); // Use user routes

// Rutas de asistencia
router.use('/attendance', attendanceRoutes); // Use attendance routes

// Rutas de calificaciones
router.use('/grades', gradeRoutes); // Use grade routes

// Ruta de salud del API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta por defecto para rutas no encontradas
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

export default router;