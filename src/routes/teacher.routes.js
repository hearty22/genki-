import { Router } from "express";
import {
  createTeacher,
  getInstitutionTeachers,
  getTeacherSubjects
} from "../controllers/teacher.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validator } from "../validators/validator.js";

const teacherRouter = Router();

// Todas las rutas requieren autenticación
teacherRouter.use(authMiddleware);

// Crear un nuevo docente (Solo administradores)
teacherRouter.post("/institutions/:id/teachers", createTeacher);

// Obtener docentes de una institución
teacherRouter.get("/institutions/:id/teachers", getInstitutionTeachers);

// Obtener materias de un docente
teacherRouter.get("/teachers/:id/subjects", getTeacherSubjects);

export default teacherRouter;
