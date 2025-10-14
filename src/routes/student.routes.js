import { Router } from "express";
import {
  createStudent,
  getInstitutionStudents,
  getStudentById,
  updateStudent,
  changeStudentStatus
} from "../controllers/student.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validator } from "../validators/validator.js";

const studentRouter = Router();

// Todas las rutas requieren autenticación
studentRouter.use(authMiddleware);

// Crear un nuevo estudiante (Solo administradores)
studentRouter.post("/institutions/:id/students", createStudent);

// Obtener estudiantes de una institución
studentRouter.get("/institutions/:id/students", getInstitutionStudents);

// Obtener un estudiante específico
studentRouter.get("/students/:id", getStudentById);

// Actualizar estudiante (Solo administradores)
studentRouter.put("/students/:id", updateStudent);

// Cambiar estado de estudiante (Solo administradores)
studentRouter.patch("/students/:id/status", changeStudentStatus);

export default studentRouter;
