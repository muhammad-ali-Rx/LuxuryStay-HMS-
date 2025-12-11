import express from "express";
import {
  createTask,
  getBookingTasks,
  getAllTasks,
  updateTask,
  deleteTask
} from "../Controller/taskController.mjs";
import { auth, authorize } from "../middleware/auth.mjs"; // Assuming auth/authorize middleware is correctly imported

const router = express.Router();

// Middleware for staff authorization (Admin, Manager, Receptionist)
const staffAuth = [auth, authorize(["admin", "manager", "receptionist"])];

// =================================================================
// 1. GET All Tasks (Admin Dashboard View)
// =================================================================
// Requires staff authorization to see all tasks
router.get("/", staffAuth, getAllTasks);

// =================================================================
// 2. CREATE Task (Booking-linked or Standalone)
// =================================================================
// Requires standard authentication (Guest or Admin can create)
router.post("/", auth, createTask); 

// =================================================================
// 3. GET Tasks for a specific Booking
// =================================================================
// Accessible by any authenticated user (guest or staff) who has access rights 
// to see the booking tasks
router.get("/booking/:bookingId", auth, getBookingTasks);

// =================================================================
// 4. Update/Delete Task (Staff Management)
// =================================================================
router.put("/:id", staffAuth, updateTask);
router.delete("/:id", staffAuth, deleteTask);


export default router;