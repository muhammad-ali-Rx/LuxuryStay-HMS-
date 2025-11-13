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
        "French", "Italian", "Japanese", "Chinese", "Indian",
        "Mexican", "Mediterranean", "American", "International", "Fusion"
      ],
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
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
    openingHours: {
      monday: { open: String, close: String, closed: Boolean },
      tuesday: { open: String, close: String, closed: Boolean },
      wednesday: { open: String, close: String, closed: Boolean },
      thursday: { open: String, close: String, closed: Boolean },
      friday: { open: String, close: String, closed: Boolean },
      saturday: { open: String, close: String, closed: Boolean },
      sunday: { open: String, close: String, closed: Boolean }
    },
    capacity: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    tags: [{
      type: String
    }],
    contact: {
      phone: String,
      email: String,
      extension: String
    },
    features: {
      hasOutdoorSeating: { type: Boolean, default: false },
      hasPrivateDining: { type: Boolean, default: false },
      hasWifi: { type: Boolean, default: true },
      isWheelchairAccessible: { type: Boolean, default: true },
      hasParking: { type: Boolean, default: true }
    },
    status: {
      type: String,
      enum: ["active", "inactive", "under_renovation"],
      default: "active"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true,
  }
);

// Rating calculation methods
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