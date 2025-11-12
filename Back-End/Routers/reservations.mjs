import express from 'express';
import {
  createReservation,
  getUserReservations,
  getAllReservations,
  updateReservationStatus,
  checkInGuest,
  addFeedback
} from '../Controller/reservationController.mjs';

const router = express.Router();

// User routes (any authenticated user)
router.post('/',  createReservation);
router.get('/my-reservations',  getUserReservations);
router.post('/:id/feedback',  addFeedback);

// Staff routes (admin, manager, receptionist)
router.get('/',getAllReservations);
router.put('/:id/status',  updateReservationStatus);
router.put('/:id/checkin',  checkInGuest);

export default router;