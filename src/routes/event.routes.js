import { Router } from "express";
import {
  createEvent,
  getInstitutionEvents,
  getEventById,
  updateEvent,
  deleteEvent
} from "../controllers/event.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validator } from "../validators/validator.js";

const eventRouter = Router();

// Todas las rutas requieren autenticación
eventRouter.use(authMiddleware);

// Crear un nuevo evento (Solo administradores)
eventRouter.post("/institutions/:id/events", createEvent);

// Obtener eventos de una institución
eventRouter.get("/institutions/:id/events", getInstitutionEvents);

// Obtener un evento específico
eventRouter.get("/events/:id", getEventById);

// Actualizar evento (Solo administradores)
eventRouter.put("/events/:id", updateEvent);

// Eliminar evento (Solo administradores)
eventRouter.delete("/events/:id", deleteEvent);

export default eventRouter;
