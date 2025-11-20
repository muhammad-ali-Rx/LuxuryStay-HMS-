import Booking from "../Models/Booking.mjs";
import Payment from "../Models/payment.mjs";
import User from "../Models/users.mjs";
import Room from "../Models/Room.mjs";
import { Parser } from "json2csv";

// Get Revenue Summary (Dashboard)
export const getRevenueSummary = async (req, res) => {
  try {
    const payments = await Payment.find();

    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
    const paidAmount = payments
      .filter(p => p.status === "paid")
      .reduce((acc, p) => acc + p.amount, 0);
    const pendingAmount = totalRevenue - paidAmount;
    const totalBookings = payments.length;

    res.json({
      totalRevenue,
      paidAmount,
      pendingAmount,
      totalBookings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};



// Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$subtotal" } } },
    ]);
    const occupancyRate = await Booking.getOccupancyRate(new Date());
    const totalGuests = await User.countDocuments({ role: "guest" });
    const activeStaff = await User.countDocuments({ role: { $ne: "guest" }, status: "Active" });

    res.json({
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      occupancyRate,
      totalGuests,
      activeStaff,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

// Revenue Reports
export const getRevenueReports = async (req, res) => {
  try {
    const { period } = req.params; // daily, monthly, yearly
    let groupBy = {};

    if (period === "daily") groupBy = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
    if (period === "monthly") groupBy = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
    if (period === "yearly") groupBy = { year: { $year: "$createdAt" } };

    const report = await Payment.aggregate([
      { $group: { _id: groupBy, totalRevenue: { $sum: "$subtotal" }, totalPaid: { $sum: "$paid" }, totalPending: { $sum: "$pending" }, bookings: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching revenue report" });
  }
};

// Occupancy Reports
export const getOccupancyReports = async (req, res) => {
  try {
    const bookings = await Booking.find({ bookingStatus: { $in: ["confirmed", "checked-in"] } }).populate("room");
    const totalRooms = await Room.countDocuments();

    const occupiedRooms = bookings.length;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    res.json({ totalRooms, occupiedRooms, occupancyRate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching occupancy report" });
  }
};

// Booking Reports
export const getBookingReports = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("guest")
      .populate("room")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching booking report" });
  }
};

// Guest Reports
export const getGuestReports = async (req, res) => {
  try {
    const guests = await User.find({ role: "guest" });
    res.json(guests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching guest report" });
  }
};

// Staff Reports
export const getStaffReports = async (req, res) => {
  try {
    const staff = await User.find({ role: { $ne: "guest" } });
    res.json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching staff report" });
  }
};

// Export Reports (CSV)
export const exportReport = async (req, res) => {
  try {
    const { type } = req.params; // bookings, payments, guests, staff
    let data = [];

    switch (type) {
      case "bookings":
        data = await Booking.find().populate("guest room");
        break;
      case "payments":
        data = await Payment.find();
        break;
      case "guests":
        data = await User.find({ role: "guest" });
        break;
      case "staff":
        data = await User.find({ role: { $ne: "guest" } });
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    const json2csv = new Parser();
    const csv = json2csv.parse(data);
    res.header("Content-Type", "text/csv");
    res.attachment(`${type}-report.csv`);
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error exporting report" });
  }
};
