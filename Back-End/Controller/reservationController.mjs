import Reservation from "../Models/Reservation.js";
import Restaurant from "../Models/Restaurant.mjs";


export const createReservation = async (req, res) => {
  try {
    console.log("=== DEBUG RESERVATION CREATION ===");
    console.log("Request user:", req.user);
    console.log("User ID:", req.user?._id);
    console.log("Request body:", req.body);

    const {
      restaurantId,
      reservationDate,
      reservationTime,
      partySize,
      specialRequests,
      occasion,
      guestName,
      guestEmail,
      guestPhone
    } = req.body;

    // Check restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check availability
    const existingReservations = await Reservation.countDocuments({
      restaurant: restaurantId,
      reservationDate,
      reservationTime,
      status: { $in: ['confirmed', 'pending'] }
    });

    const availableCapacity = restaurant.capacity - (existingReservations * 4);
    if (availableCapacity < partySize) {
      return res.status(400).json({
        success: false,
        message: 'No tables available for requested party size and time'
      });
    }

    // Prepare reservation data
    const reservationData = {
      restaurant: restaurantId,
      reservationDate,
      reservationTime,
      partySize,
      specialRequests: specialRequests || "",
      occasion: occasion || "none",
      status: 'confirmed'
    };

    // ✅ FIX: Handle both authenticated and non-authenticated users
    if (req.user && req.user._id) {
      // Authenticated user
      reservationData.guest = req.user._id;
      reservationData.guestDetails = {
        name: req.user.name || guestName,
        email: req.user.email || guestEmail,
        phone: req.user.phone || guestPhone
      };
      console.log("✅ Creating reservation for authenticated user:", req.user._id);
    } else {
      // Non-authenticated user - guestDetails is required
      if (!guestName || !guestEmail || !guestPhone) {
        return res.status(400).json({
          success: false,
          message: 'Guest details (name, email, phone) are required'
        });
      }
      reservationData.guestDetails = {
        name: guestName,
        email: guestEmail,
        phone: guestPhone
      };
      console.log("✅ Creating reservation for non-authenticated guest");
    }

    console.log("🎯 Final reservation data:", reservationData);

    // Create reservation
    const reservation = await Reservation.create(reservationData);

    await reservation.populate('restaurant', 'name cuisine location');
    if (reservation.guest) {
      await reservation.populate('guest', 'name email phone');
    }

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: reservation
    });
  } catch (error) {
    console.error('❌ Error creating reservation:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Reservation validation failed',
        errors: errors
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating reservation',
      error: error.message
    });
  }
};

// ✅ Get user's reservations
export const getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ guest: req.user.userId })
      .populate('restaurant', 'name cuisine location images')
      .sort({ reservationDate: -1, reservationTime: -1 });

    res.json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    console.error('Error getting user reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ Get all reservations (for admin)
export const getAllReservations = async (req, res) => {
  try {
    const { restaurant, status, date } = req.query;
    
    let filter = {};
    if (restaurant) filter.restaurant = restaurant;
    if (status) filter.status = status;
    if (date) filter.reservationDate = date;

    const reservations = await Reservation.find(filter)
      .populate('guest', 'name email phone')
      .populate('restaurant', 'name cuisine')
      .populate('assignedStaff', 'name')
      .sort({ reservationDate: 1, reservationTime: 1 });

    res.json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    console.error('Error getting all reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ Update reservation status
export const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate('guest', 'name email phone')
    .populate('restaurant', 'name');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Reservation status updated successfully',
      data: reservation
    });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating reservation',
      error: error.message
    });
  }
};

// ✅ Check-in guest
export const checkInGuest = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      {
        checkedIn: true,
        checkedInAt: new Date(),
        assignedStaff: req.user.userId
      },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Guest checked in successfully',
      data: reservation
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(400).json({
      success: false,
      message: 'Error during check-in',
      error: error.message
    });
  }
};

// ✅ Add feedback
export const addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      {
        feedback: {
          rating,
          comment,
          submittedAt: new Date()
        }
      },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Update restaurant rating
    if (rating && reservation.restaurant) {
      const restaurant = await Restaurant.findById(reservation.restaurant);
      if (restaurant) {
        await restaurant.addRating(req.user.userId, rating);
        await restaurant.save();
      }
    }

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: reservation
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(400).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

// ✅ Check availability
export const checkAvailability = async (req, res) => {
  try {
    const { date, time, partySize } = req.query;
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if restaurant is open at requested time
    const reservationDate = new Date(date);
    const dayOfWeek = reservationDate.toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
    const operatingHours = restaurant.openingHours[dayOfWeek];

    if (!operatingHours || operatingHours.closed) {
      return res.json({
        success: true,
        available: false,
        message: 'Restaurant is closed on this day'
      });
    }

    // Check capacity against existing reservations
    const existingReservations = await Reservation.countDocuments({
      restaurant: req.params.id,
      reservationDate: date,
      reservationTime: time,
      status: { $in: ['confirmed', 'pending'] }
    });

    const totalBookedCapacity = existingReservations * 4; // Assuming 4 people per reservation
    const availableCapacity = restaurant.capacity - totalBookedCapacity;

    const available = availableCapacity >= parseInt(partySize);

    res.json({
      success: true,
      available,
      availableCapacity,
      totalCapacity: restaurant.capacity,
      message: available ? 'Table available' : 'No tables available for requested party size'
    });
  } catch (error) {
    console.error('Error in checkAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ Cancel reservation
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        cancelledAt: new Date()
      },
      { new: true }
    )
    .populate('guest', 'name email phone')
    .populate('restaurant', 'name');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(400).json({
      success: false,
      message: 'Error cancelling reservation',
      error: error.message
    });
  }
};