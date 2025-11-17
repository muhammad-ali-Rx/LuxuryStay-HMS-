import express from 'express';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addRating,
  checkAvailability,
  getRestaurantStats,
  testAuth
} from '../Controller/restaurantController.mjs';
import { auth } from "../middleware/auth.mjs" ;
import { upload } from "../Config/cloudinary.config.mjs"; 

const router = express.Router();

// Public routes
router.get('/', getAllRestaurants);
router.get('/stats', getRestaurantStats);
router.get('/:id', getRestaurantById);
router.get('/:id/availability', checkAvailability);

// Test auth route
router.get('/test/auth', auth, testAuth);

// Protected routes (require authentication)
router.post('/:id/rating', auth, addRating);

// Admin routes (require authentication)
router.post('/', auth, upload.array("images"),  createRestaurant);
router.put('/:id', upload.array("images"),  updateRestaurant);
router.delete('/:id', auth, deleteRestaurant);

export default router;