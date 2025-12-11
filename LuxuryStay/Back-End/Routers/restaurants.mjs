import express from 'express';
import {
  createRestaurant,
  updateRestaurant,
  getAllRestaurants,
  getRestaurantById,
  deleteRestaurant,
  addRating,
  checkAvailability,
  getRestaurantStats,
  testAuth
} from '../Controller/restaurantController.mjs';
import { auth } from '../middleware/auth.mjs';

const router = express.Router();

// Public routes
router.get('/', getAllRestaurants); // GET /restaurants
router.get('/:id', getRestaurantById);
router.get('/:id/availability', checkAvailability);

// Protected routes (admin only)
router.post('/', auth, createRestaurant);
router.put('/:id', auth, updateRestaurant);
router.delete('/:id', auth, deleteRestaurant);
router.post('/:id/rating', auth, addRating);

// Admin stats
router.get('/stats/overview', auth, getRestaurantStats);

// Test route
router.get('/auth/test', auth, testAuth);

export default router;