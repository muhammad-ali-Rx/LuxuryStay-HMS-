import User from "../Models/users.mjs";
import Room from "../Models/Room.mjs";
import Booking from "../Models/Booking.mjs";
import Payment from "../Models/payment.mjs";

// Get complete dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // ✅ Users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "Active" });

    // ✅ Rooms
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ isAvailable: true });

    // ✅ Bookings
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({
      bookingStatus: { $in: ["confirmed", "checked-in"] },
    });

    // ✅ FIXED: Get payment stats from BOOKINGS instead of Payment model
    const paymentStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalPaid: { $sum: "$payment.paidAmount" },
          totalPending: {
            $sum: {
              $subtract: ["$totalAmount", "$payment.paidAmount"]
            }
          },
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    // ✅ Recent Bookings (last 5)
    const recentBookings = await Booking.find({})
      .populate("guest", "name email")
      .populate("room", "roomNumber roomType")
      .sort({ createdAt: -1 })
      .limit(5);

    // ✅ FIXED: Recent payments data from bookings
    const recentPayments = await Booking.find({})
      .populate("guest", "name email")
      .populate("room", "roomNumber roomType")
      .sort({ createdAt: -1 })
      .limit(5)
      .then(bookings => 
        bookings.map(booking => ({
          _id: booking._id,
          guestName: booking.guestDetails?.name || booking.guest?.name || "Unknown Guest",
          guestEmail: booking.guestDetails?.email || booking.guest?.email || "",
          subtotal: booking.totalAmount,
          paid: booking.payment?.paidAmount || 0,
          pending: booking.totalAmount - (booking.payment?.paidAmount || 0),
          paymentStatus: booking.paymentStatus,
          roomNumber: booking.roomNumber,
          roomType: booking.roomType,
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          createdAt: booking.createdAt
        }))
      );

    const stats = paymentStats[0] || {
      totalRevenue: 0,
      totalPaid: 0,
      totalPending: 0,
      totalBookings: 0
    };

    res.status(200).json({
      users: { totalUsers, activeUsers },
      rooms: { totalRooms, availableRooms },
      bookings: { 
        totalBookings, 
        activeBookings, 
        recentBookings: recentBookings.map(booking => ({
          _id: booking._id,
          guest: {
            name: booking.guestDetails?.name || booking.guest?.name || "Unknown Guest",
            email: booking.guestDetails?.email || booking.guest?.email || ""
          },
          room: {
            roomNumber: booking.roomNumber,
            roomType: booking.roomType
          },
          bookingStatus: booking.bookingStatus,
          totalAmount: booking.totalAmount,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate
        }))
      },
      payments: {
        totalRevenue: stats.totalRevenue || 0,
        totalPaid: stats.totalPaid || 0,
        totalPending: stats.totalPending || 0,
        totalBookings: stats.totalBookings || 0,
        recentPayments
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};