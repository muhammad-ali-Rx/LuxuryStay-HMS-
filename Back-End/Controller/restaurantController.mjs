import Restaurant from "../Models/Restaurant.mjs";

export const createRestaurant = async (req, res) => {
  try {
    console.log('🔐 User creating restaurant:', req.user);
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    // FIX: Check all possible user ID fields
    const currentUserId = req.user?.userId || req.user?._id || req.user?.id;
    
    if (!currentUserId) {
      console.log('❌ No user ID found in req.user:', req.user);
      return res.status(401).json({
        success: false,
        message: 'Authentication required - User ID not found'
      });
    }

    // Validate required fields
    const requiredFields = ['name', 'cuisine', 'description', 'capacity', 'location'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const restaurantData = {
      ...req.body,
      createdBy: currentUserId
    };

    console.log('🎯 Final restaurant data for creation:', restaurantData);

    const restaurant = await Restaurant.create(restaurantData);
    
    console.log('✅ Restaurant created successfully:', restaurant._id);
    
    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant
    });

  } catch (error) {
    console.error('❌ Error creating restaurant:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating restaurant',
      error: error.message
    });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating restaurant',
      error: error.message
    });
  }
};

export const getAllRestaurants = async (req, res) => {
  try {
    console.log('📋 Fetching all restaurants...');
    const restaurants = await Restaurant.find().populate('createdBy', 'name email');
    
    console.log(`✅ Found ${restaurants.length} restaurants`);
    
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

    await restaurant.addRating(req.user.userId, rating);
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

    // Simple capacity check
    const available = parseInt(partySize) <= restaurant.capacity;

    res.json({
      success: true,
      available,
      availableCapacity: restaurant.capacity,
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

// Test auth endpoint
export const testAuth = async (req, res) => {
  try {
    console.log('🔐 Test Auth - User:', req.user);
    res.json({
      success: true,
      message: 'Authentication successful',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Auth test failed',
      error: error.message
    });
  }
};