import express from 'express';
import { generateDynamic } from '../controllers/chatbotController.js';
import { authenticateToken } from '../middleware/auth.js';

const ChatBotrouter = express.Router();

// Ruta para generar una dinámica de clase
ChatBotrouter.post('/generate-dynamic', authenticateToken, generateDynamic);

export default ChatBotrouter;