import express from 'express';
import { contactController } from '../Controller/contactController.mjs';

const router = express.Router();

// Contact form routes
router.post('/contact', contactController.submitContact);
router.get('/contact/test-email', contactController.testEmail);

export default router;