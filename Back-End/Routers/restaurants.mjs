import express from 'express';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addRating,
  checkAvailability
} from '../Controller/restaurantController.mjs';
import { auth,  } from '../middleware/auth.mjs'; 

const router = express.Router();

// Public routes
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/availability', checkAvailability);

// Protected routes (any authenticated user)
router.post('/:id/rating', auth, addRating);

// Admin/Manager routes - ADD AUTH MIDDLEWARE
router.post('/', auth,  createRestaurant);
router.put('/:id', auth,  updateRestaurant);
router.delete('/:id', auth,  deleteRestaurant);

export default router;