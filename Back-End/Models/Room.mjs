import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    roomType: {
      type: String,
      enum: [
        "Standard",
        "Deluxe",
        "Suite",
        "Presidential",
        "Penthouse",
        "Family",
        "Twin",
        "Single",
        "Double",
      ],
      required: true,
    },

    // 💰 Price set by Admin
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    // 🏠 Current status of room
    status: {
      type: String,
      enum: ["Vacant", "Occupied", "Reserved", "Cleaning", "Maintenance"],
      default: "Vacant",
    },

    // 🖼️ Images of room
    images: {
      type: [String],
      required: [true, "Images are required"],
    },

    // 🧺 Amenities (for display in UI)
    amenities: {
      type: [String],
      default: ["WiFi", "TV", "AC", "Mini Fridge"],
    },

    // 📜 Description of room
    description: {
      type: String,
      default: "",
    },

    // 👥 Maximum guest capacity
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 2, // default 2 guests
    },

    // ⭐ Rating System
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    // 📊 Rating distribution (1-5 stars)
    ratingCounts: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    },

    // 👤 Track individual user ratings (to prevent multiple ratings)
    userRatings: [{
      userId: {
        type: String, // Can be changed to ObjectId if you have User model
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      ratedAt: {
        type: Date,
        default: Date.now
      },
      userIP: { // Optional: for additional security
        type: String,
        default: ""
      }
    }],

    // 📈 Rating statistics (calculated fields)
    ratingStats: {
      average: {
        type: Number,
        default: 0
      },
      distribution: {
        type: Map,
        of: Number,
        default: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        }
      },
      lastCalculated: {
        type: Date,
        default: Date.now
      }
    },

    // 🗳️ Total number of reviews (optional - if you add reviews later)
    reviewsCount: {
      type: Number,
      default: 0,
    },

    // 📆 Optional: last cleaned date
    lastCleaned: {
      type: Date,
    },

    // 👨‍💼 Which staff/admin added the room
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 🔧 Room specifications
    size: {
      type: String, // e.g., "45 sqm"
      default: ""
    },

    bedType: {
      type: String,
      enum: ["Single", "Double", "Queen", "King", "Twin", "Multiple"],
      default: "Double"
    },

    // 🌟 Featured room
    isFeatured: {
      type: Boolean,
      default: false
    },

    // 🔐 Availability
    isAvailable: {
      type: Boolean,
      default: true
    },

    // 📍 Room location details
    floor: {
      type: Number,
      min: 1,
      default: 1
    },

    view: {
      type: String,
      enum: ["City", "Ocean", "Garden", "Pool", "Mountain", "Street"],
      default: "City"
    }

  },
  {
    timestamps: true,
  }
);

// ✅ Pre-save middleware to calculate rating statistics
roomSchema.pre('save', function(next) {
  if (this.userRatings && this.isModified('userRatings')) {
    this.calculateRatingStats();
  }
  next();
});

// ✅ Method to calculate rating statistics
roomSchema.methods.calculateRatingStats = function() {
  if (this.userRatings.length === 0) {
    this.rating = 0;
    this.totalRatings = 0;
    this.ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.ratingStats = {
      average: 0,
      distribution: new Map([[1, 0], [2, 0], [3, 0], [4, 0], [5, 0]]),
      lastCalculated: new Date()
    };
    return;
  }

  // Calculate total and average
  const totalRating = this.userRatings.reduce((sum, ur) => sum + ur.rating, 0);
  this.totalRatings = this.userRatings.length;
  this.rating = parseFloat((totalRating / this.totalRatings).toFixed(1));

  // Calculate rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  this.userRatings.forEach(ur => {
    distribution[ur.rating]++;
  });
  this.ratingCounts = distribution;

  // Update rating stats
  this.ratingStats = {
    average: this.rating,
    distribution: new Map(Object.entries(distribution)),
    lastCalculated: new Date()
  };
};

// ✅ Method to add rating (with duplicate check)
roomSchema.methods.addRating = function(userId, rating, userIP = "") {
  // Check if user already rated
  const existingRating = this.userRatings.find(ur => ur.userId === userId);
  
  if (existingRating) {
    throw new Error('User has already rated this room');
  }

  // Add new rating
  this.userRatings.push({
    userId,
    rating,
    userIP,
    ratedAt: new Date()
  });

  // Recalculate statistics
  this.calculateRatingStats();

  return this;
};

// ✅ Method to get user's rating
roomSchema.methods.getUserRating = function(userId) {
  const userRating = this.userRatings.find(ur => ur.userId === userId);
  return userRating ? userRating.rating : null;
};

// ✅ Method to update user's rating
roomSchema.methods.updateUserRating = function(userId, newRating) {
  const userRatingIndex = this.userRatings.findIndex(ur => ur.userId === userId);
  
  if (userRatingIndex === -1) {
    throw new Error('User has not rated this room yet');
  }

  this.userRatings[userRatingIndex].rating = newRating;
  this.userRatings[userRatingIndex].ratedAt = new Date();

  // Recalculate statistics
  this.calculateRatingStats();

  return this;
};

// ✅ Method to remove user's rating
roomSchema.methods.removeUserRating = function(userId) {
  const initialLength = this.userRatings.length;
  this.userRatings = this.userRatings.filter(ur => ur.userId !== userId);
  
  if (this.userRatings.length === initialLength) {
    throw new Error('User rating not found');
  }

  // Recalculate statistics
  this.calculateRatingStats();

  return this;
};

// ✅ Static method to get top rated rooms
roomSchema.statics.getTopRated = function(limit = 10) {
  return this.find({ 
    'totalRatings': { $gte: 1 },
    'rating': { $gte: 4 }
  })
  .sort({ rating: -1, totalRatings: -1 })
  .limit(limit);
};

// ✅ Static method to get rooms by rating range
roomSchema.statics.getByRatingRange = function(minRating = 0, maxRating = 5) {
  return this.find({
    'rating': { $gte: minRating, $lte: maxRating }
  }).sort({ rating: -1 });
};

// ✅ Virtual for rating percentage (for UI)
roomSchema.virtual('ratingPercentage').get(function() {
  return (this.rating / 5) * 100;
});

// ✅ Virtual for formatted rating display
roomSchema.virtual('formattedRating').get(function() {
  return this.rating.toFixed(1);
});

// ✅ Index for better performance
roomSchema.index({ rating: -1 });
roomSchema.index({ totalRatings: -1 });
roomSchema.index({ 'userRatings.userId': 1 });
roomSchema.index({ roomType: 1, rating: -1 });

export default mongoose.model("Room", roomSchema);