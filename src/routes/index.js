import express from 'express';
import authRoutes from './authRoutes.js';
import classRoutes from './classRoutes.js'; // Import class routes
import assessmentRoutes from './assessmentRoutes.js'; // Import assessment routes

const router = express.Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de clases
router.use('/classes', classRoutes); // Use class routes

// Rutas de evaluaciones
router.use( assessmentRoutes); // Use assessment routes

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