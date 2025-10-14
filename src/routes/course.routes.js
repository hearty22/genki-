import { Router } from "express";
import {
  createCourse,
  getCareerCourses,
  getCourseById,
  updateCourse,
  deleteCourse
} from "../controllers/course.controller.js";
import { authMiddleware, isAdmin } from "../middlewares/auth.js";
import { validator } from "../validators/validator.js";

const courseRouter = Router();

// Todas las rutas requieren autenticación
courseRouter.use(authMiddleware);

// Crear un nuevo curso (Solo administradores)
courseRouter.post("/careers/:id/courses", isAdmin, createCourse);

// Obtener cursos de una carrera
courseRouter.get("/careers/:id/courses", getCareerCourses);

// Obtener un curso específico
courseRouter.get("/courses/:id", getCourseById);

// Actualizar curso (Solo administradores)
courseRouter.put("/courses/:id", isAdmin, updateCourse);

// Eliminar curso (Solo administradores)
courseRouter.delete("/courses/:id", isAdmin, deleteCourse);

export default courseRouter;
