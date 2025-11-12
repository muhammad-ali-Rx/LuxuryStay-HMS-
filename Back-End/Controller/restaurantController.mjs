import Restaurant from "../Models/Restaurant.mjs";
import Reservation from "../Models/Reservation.js";

export const createRestaurant = async (req, res) => {
  try {
    console.log('🔐 User creating restaurant:', req.user); // Debug log
    
    // Now req.user should be available from the authentication middleware
    if (!req.user || !req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'User authentication failed',
        error: 'User information not found in request'
      });
    }

    const restaurantData = {
      ...req.body,
      createdBy: req.user.id, // Use the authenticated user's ID
      userId: req.user.id
    };

    console.log('📝 Creating restaurant with data:', restaurantData);

    const restaurant = await Restaurant.create(restaurantData);
    
    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant
    });

  } catch (error) {
    console.error('❌ Error creating restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating restaurant',
      error: error.message
    });
  }
};

// Update other controller functions to use req.user if needed
export const updateRestaurant = async (req, res) => {
  try {
    console.log('🔐 User updating restaurant:', req.user);
    
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant
    });

  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating restaurant',
      error: error.message
    });
  }
};

// Keep other functions as they are, but add req.user logging for debugging
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate('createdBy', 'name email');
    res.json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurants',
      error: error.message
    });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant',
      error: error.message
    });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    console.log('🔐 User deleting restaurant:', req.user);
    
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting restaurant',
      error: error.message
    });
  }
};

// ✅ Add rating to restaurant
export const addRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    await restaurant.addRating(req.user.id, rating);
    await restaurant.save();

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: restaurant
    });
  } catch (error) {
    console.error('Error in addRating:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      error: error.message
    });
  }
};

// ✅ Check table availability
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

    if (!operatingHours || !operatingHours.open || !operatingHours.close) {
      return res.json({
        success: true,
        available: false,
        message: 'Restaurant is closed on this day'
      });
    }

    // Check capacity
    const existingReservations = await Reservation.countDocuments({
      restaurant: req.params.id,
      reservationDate: date,
      reservationTime: time,
      status: { $in: ['confirmed', 'pending'] }
    });

    const totalBookedCapacity = existingReservations * 4;
    const availableCapacity = restaurant.capacity - totalBookedCapacity;

    const available = availableCapacity >= parseInt(partySize);

    res.json({
      success: true,
      available,
      availableCapacity,
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

// ✅ Get restaurant statistics
export const getRestaurantStats = async (req, res) => {
  try {
    const totalRestaurants = await Restaurant.countDocuments();
    const activeRestaurants = await Restaurant.countDocuments({ status: 'active' });
    
    const popularCuisines = await Restaurant.aggregate([
      { $group: { _id: '$cuisine', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        totalRestaurants,
        activeRestaurants,
        popularCuisines
      }
    });
  } catch (error) {
    console.error('Error in getRestaurantStats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};