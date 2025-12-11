import Booking from "../Models/Booking.mjs";
import Room from "../Models/Room.mjs";
import User from "../Models/users.mjs";
import { io } from "../app.mjs";

// ✅ Create new booking (User)
export const createBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;
    const userId = req.user._id;

    // Check if room exists and is available
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    if (room.status !== 'Vacant' || !room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Room is not available for booking"
      });
    }

    // Check if room capacity is sufficient
    if (numberOfGuests > room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room capacity is ${room.capacity} guests only`
      });
    }

    // Check for booking conflicts
    const existingBooking = await Booking.findOne({
      room: roomId,
      bookingStatus: { $in: ['confirmed', 'checked-in'] },
      $or: [
        {
          checkInDate: { $lte: checkOutDate },
          checkOutDate: { $gte: checkInDate }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Room is already booked for the selected dates"
      });
    }

    // Calculate total nights and amount
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * room.pricePerNight;

    // Create booking
    const booking = new Booking({
      guest: userId,
      room: roomId,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalAmount,
      guestDetails: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '',
        specialRequests: specialRequests || ''
      },
      bookingSource: 'website'
    });

    await booking.save();

    // Update user booking status
    await User.findByIdAndUpdate(userId, {
      bookingStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully and pending approval",
      data: booking
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message
    });
  }
};

// ✅ Get available rooms for dates
export const getAvailableRooms = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, roomType, guests } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "Check-in and check-out dates are required"
      });
    }

    // Find conflicting bookings
    const conflictingBookings = await Booking.find({
      bookingStatus: { $in: ['confirmed', 'checked-in'] },
      $or: [
        {
          checkInDate: { $lte: new Date(checkOutDate) },
          checkOutDate: { $gte: new Date(checkInDate) }
        }
      ]
    }).select('room');

    const bookedRoomIds = conflictingBookings.map(booking => booking.room);

    // Find available rooms
    let filter = {
      _id: { $nin: bookedRoomIds },
      status: 'Vacant',
      isAvailable: true
    };

    if (roomType && roomType !== 'all') {
      filter.roomType = roomType;
    }

    if (guests) {
      filter.capacity = { $gte: parseInt(guests) };
    }

    const availableRooms = await Room.find(filter);

    res.status(200).json({
      success: true,
      data: availableRooms,
      total: availableRooms.length
    });

  } catch (error) {
    console.error("Error fetching available rooms:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available rooms",
      error: error.message
    });
  }
};

// ✅ Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const bookings = await Booking.find({ guest: userId })
      .populate('room', 'roomNumber roomType images amenities')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user bookings",
      error: error.message
    });
  }
};

// ✅ Get all bookings (Staff/Admin)
export const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = '-createdAt' } = req.query;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.bookingStatus = status;
    }

    const bookings = await Booking.find(filter)
      .populate('guest', 'name email phone')
      .populate('room', 'roomNumber roomType pricePerNight')
      .populate('assignedBy', 'name')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBookings: total
      }
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message
    });
  }
};

// ✅ Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guest', 'name email phone address')
      .populate('room', 'roomNumber roomType pricePerNight images amenities')
      .populate('assignedBy', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if user has permission to view this booking
    if (req.user.role === 'user' && booking.guest._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message
    });
  }
};

// ✅ Update booking status (Staff/Admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingStatus, notes } = req.body;
    const staffId = req.user._id;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Update booking
    booking.bookingStatus = bookingStatus;
    if (notes) booking.notes = notes;
    booking.assignedBy = staffId;

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${bookingStatus} successfully`,
      data: booking
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking status",
      error: error.message
    });
  }
};

// ✅ Check-in booking (Receptionist/Manager)
export const checkInBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (booking.bookingStatus !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be checked in"
      });
    }

    booking.bookingStatus = 'checked-in';
    booking.checkInTime = new Date();
    booking.assignedBy = req.user._id;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Guest checked in successfully",
      data: booking
    });

  } catch (error) {
    console.error("Error during check-in:", error);
    res.status(500).json({
      success: false,
      message: "Error during check-in",
      error: error.message
    });
  }
};

// ✅ Check-out booking (Receptionist/Manager)
export const checkOutBooking = async (req, res) => {
  try {
    const { paymentStatus, paidAmount } = req.body;

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (booking.bookingStatus !== 'checked-in') {
      return res.status(400).json({
        success: false,
        message: "Only checked-in bookings can be checked out"
      });
    }

    booking.bookingStatus = 'checked-out';
    booking.checkOutTime = new Date();
    booking.paymentStatus = paymentStatus || 'paid';
    booking.payment.paidAmount = paidAmount || booking.totalAmount;
    booking.payment.paymentDate = new Date();
    booking.assignedBy = req.user._id;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Guest checked out successfully",
      data: booking
    });

  } catch (error) {
    console.error("Error during check-out:", error);
    res.status(500).json({
      success: false,
      message: "Error during check-out",
      error: error.message
    });
  }
};

// ✅ Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (!booking.canCancel()) {
      return res.status(400).json({
        success: false,
        message: "This booking cannot be cancelled"
      });
    }

    // Check permission
    if (req.user.role === 'user' && booking.guest.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: userId,
      reason: reason || ''
    };

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking
    });

  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message
    });
  }
};

// ✅ Get booking statistics
export const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ bookingStatus: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const checkedInBookings = await Booking.countDocuments({ bookingStatus: 'checked-in' });
    
    const today = new Date();
    const todayBookings = await Booking.countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999))
      }
    });

    // Revenue calculation
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          bookingStatus: { $in: ['checked-out'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          monthlyRevenue: {
            $sum: {
              $cond: [
                { 
                  $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)] 
                },
                '$totalAmount',
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      checkedInBookings,
      todayBookings,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      monthlyRevenue: revenueResult[0]?.monthlyRevenue || 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Error fetching booking statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking statistics",
      error: error.message
    });
  }
};

export const addTaskToBooking = async (req, res) => {
    const { id } = req.params; // Booking ID
    // 💡 Only destructure the fields from your simplified schema
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ success: false, message: "Task title and description are required." });
    }

    try {
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }
        
        // Define the new task object with simplified fields
        const newTask = {
            title,
            description,
            date: new Date(),
        };

        booking.tasks.push(newTask);
        
        await booking.save(); 

        const addedTask = booking.tasks[booking.tasks.length - 1];

        // 💡 Socket.IO logic placeholder (To be implemented next)
        // This notifies the admin/staff that a new task is waiting.
        io.to('admin_room').emit('new_task_request', { bookingId: id, task: addedTask, requestedBy: req.user.name });
        console.log(`TASK ADDED: Booking ${id}, Task ${addedTask._id}. Notify staff!`);

        res.status(201).json({
            success: true,
            message: "Task successfully added to booking.",
            task: addedTask,
        });

    } catch (error) {
        console.error("Error adding task to booking:", error);
        res.status(500).json({ success: false, message: "Server error while adding task.", error: error.message });
    }
};