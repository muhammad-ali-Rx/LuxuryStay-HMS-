import express from "express";
import {
  getDashboardStats,
  getRevenueReports,
  getOccupancyReports,
  getBookingReports,
  getGuestReports,
  getStaffReports,
    exportReport,
  getRevenueSummary
} from "../Controller/reportController.mjs";

const router = express.Router();

// Dashboard Stats
router.get("/dashboard-stats",  getDashboardStats);

// Revenue Reports
router.get("/revenue/:period",  getRevenueReports); // period = daily, monthly, yearly

// Occupancy Reports
router.get("/occupancy",  getOccupancyReports);

// Booking Reports
router.get("/bookings/analytics", getBookingReports);

// Guest Reports
router.get("/guests", getGuestReports);
router.get("/summary", getRevenueSummary);
// Staff Reports
router.get("/staff", getStaffReports);

// Export CSV
router.get("/export/:type", exportReport); // type = bookings, payments, guests, staff

export default router;
