import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    cuisine: {
      type: String,
      required: true,
      enum: [
        "French",
        "Italian", 
        "Japanese",
        "Chinese",
        "Indian",
        "Mexican",
        "Mediterranean",
        "American",
        "International",
        "Fusion"
      ],
    },

    description: {
      type: String,
      required: true,
    },

    // 🖼️ Restaurant images
    images: {
      type: [String],
      default: [],
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

    // 📊 Rating distribution
    ratingCounts: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    },

    userRatings: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
      }
    }],

    // 🕒 Operating Hours
    openingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    },

    // 💰 Price Range
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      required: true
    },

    // 👥 Capacity
    capacity: {
      type: Number,
      required: true,
    },

    // 📍 Location in hotel
    location: {
      type: String,
      required: true,
    },

    // 🏷️ Tags for filtering
    tags: [{
      type: String,
      enum: [
        "Fine Dining",
        "Casual", 
        "Romantic",
        "Family Friendly",
        "Business",
        "Outdoor",
        "Buffet",
        "Bar",
        "View",
        "Live Music"
      ]
    }],

    // 🍽️ Menu Categories
    menuCategories: [{
      name: {
        type: String,
        required: true
      },
      items: [{
        name: {
          type: String,
          required: true
        },
        description: String,
        price: {
          type: Number,
          required: true
        },
        image: String,
        isVegetarian: {
          type: Boolean,
          default: false
        },
        isSpicy: {
          type: Boolean,
          default: false
        },
        allergens: [String],
        preparationTime: Number // in minutes
      }]
    }],

    // 📞 Contact
    contact: {
      phone: String,
      email: String,
      extension: String
    },

    // 👨‍🍳 Chef Information
    chef: {
      name: String,
      specialty: String,
      bio: String
    },

    // 🎯 Features
    features: {
      hasOutdoorSeating: { type: Boolean, default: false },
      hasPrivateDining: { type: Boolean, default: false },
      hasWifi: { type: Boolean, default: true },
      isWheelchairAccessible: { type: Boolean, default: true },
      hasParking: { type: Boolean, default: true }
    },

    // 📋 Reservation Settings
    reservationSettings: {
      maxAdvanceDays: { type: Number, default: 30 },
      minPartySize: { type: Number, default: 1 },
      maxPartySize: { type: Number, default: 20 },
      requiresDeposit: { type: Boolean, default: false },
      depositAmount: { type: Number, default: 0 }
    },

    // 📊 Status
    status: {
      type: String,
      enum: ["active", "inactive", "under_renovation"],
      default: "active"
    },

    // 👤 Created by
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  {
    timestamps: true,
  }
);

// ✅ Rating calculation methods
restaurantSchema.pre('save', function(next) {
  if (this.userRatings && this.isModified('userRatings')) {
    this.calculateRatingStats();
  }
  next();
});

restaurantSchema.methods.calculateRatingStats = function() {
  if (this.userRatings.length === 0) {
    this.rating = 0;
    this.totalRatings = 0;
    this.ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    return;
  }

  const totalRating = this.userRatings.reduce((sum, ur) => sum + ur.rating, 0);
  this.totalRatings = this.userRatings.length;
  this.rating = parseFloat((totalRating / this.totalRatings).toFixed(1));

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  this.userRatings.forEach(ur => {
    distribution[ur.rating]++;
  });
  this.ratingCounts = distribution;
};

restaurantSchema.methods.addRating = function(userId, rating) {
  const existingRating = this.userRatings.find(ur => ur.userId.toString() === userId.toString());
  
  if (existingRating) {
    throw new Error('User has already rated this restaurant');
  }

  this.userRatings.push({
    userId,
    rating,
    ratedAt: new Date()
  });

  this.calculateRatingStats();
  return this;
};

export default mongoose.model("Restaurant", restaurantSchema);