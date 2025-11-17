import express from "express";
import {
  createBooking,
  getAllBookings,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  getAvailableRooms,
  getBookingStats
} from "../Controller/bookingController.mjs";
import { auth, authorize } from "../middleware/auth.mjs";

const router = express.Router();

// ✅ Public routes - No authentication required
router.get("/available-rooms", getAvailableRooms);

// ✅ User routes (authenticated)
router.post("/create", auth, createBooking);
router.get("/my-bookings", auth, getUserBookings);
router.get("/:id", auth, getBookingById);
router.put("/:id/cancel", auth, cancelBooking);

// ✅ Staff/Admin routes
router.get("/", auth, authorize(["admin", "manager", "receptionist"]), getAllBookings);
router.get("/stats/dashboard", auth, authorize(["admin", "manager", "receptionist"]), getBookingStats);
router.put("/:id/status", auth, authorize(["admin", "manager", "receptionist"]), updateBookingStatus);
router.put("/:id/check-in", auth, authorize(["admin", "manager", "receptionist"]), checkInBooking);
router.put("/:id/check-out", auth, authorize(["admin", "manager", "receptionist"]), checkOutBooking);

export default router;