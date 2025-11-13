import express from 'express';
import {
  createReservation,
  getUserReservations,
  getAllReservations,
  updateReservationStatus,
  checkInGuest,
  addFeedback,
  checkAvailability
} from '../Controller/reservationController.mjs';
import { auth } from '../middleware/auth.mjs';

const router = express.Router();

// Public routes (no authentication required)
router.post('/', createReservation); // Anyone can make reservation
router.get('/:id/availability', checkAvailability); // Check availability

// Protected routes (require authentication)
router.get('/my-reservations', auth, getUserReservations);
router.post('/:id/feedback', auth, addFeedback);

// Admin routes
router.get('/', auth, getAllReservations);
router.put('/:id/status', auth, updateReservationStatus);
router.put('/:id/checkin', auth, checkInGuest);

export default router;