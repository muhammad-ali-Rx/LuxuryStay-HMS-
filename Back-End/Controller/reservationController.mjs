import Reservation from "../Models/Reservation.js";
import Restaurant from "../Models/Restaurant.mjs";

// ✅ Create new reservation
export const createReservation = async (req, res) => {
  try {
    const {
      restaurantId,
      reservationDate,
      reservationTime,
      partySize,
      specialRequests,
      occasion
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

    // Create reservation
    const reservation = await Reservation.create({
      guest: req.user.id,
      restaurant: restaurantId,
      reservationDate,
      reservationTime,
      partySize,
      specialRequests,
      occasion,
      status: 'confirmed'
    });

    await reservation.populate('restaurant', 'name cuisine priceRange location');
    await reservation.populate('guest', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: reservation
    });
  } catch (error) {
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
    const reservations = await Reservation.find({ guest: req.user.id })
      .populate('restaurant', 'name cuisine location images')
      .sort({ reservationDate: -1, reservationTime: -1 });

    res.json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
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
        assignedStaff: req.user.id
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
    if (rating) {
      const restaurant = await Restaurant.findById(reservation.restaurant);
      await restaurant.addRating(req.user.id, rating);
      await restaurant.save();
    }

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: reservation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};