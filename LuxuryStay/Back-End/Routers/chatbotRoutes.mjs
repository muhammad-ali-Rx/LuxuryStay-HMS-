// 🤖 Chatbot Routes
// API endpoints for the hotel AI chatbot service

import express from 'express';
import { chatbotChat } from '../Controller/ChatbotController.mjs';

const router = express.Router();

/**
 * POST /api/chatbot/chat
 * Main endpoint for chatbot communication
 * Receives user message and returns AI-generated response
 */
router.post('/chat', chatbotChat);

export default router;
