import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    roomNumber: {
      type: String,
      required: true,
    },

    roomType: {
      type: String,
      required: true,
    },

    checkInDate: {
      type: Date,
      required: true,
    },

    checkOutDate: {
      type: Date,
      required: true,
    },

    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "checked-in", "checked-out", "cancelled", "no-show"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially-paid"],
      default: "pending",
    },

    // Guest details at time of booking
    guestDetails: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
      },
      specialRequests: {
        type: String,
        default: "",
      },
    },

    // Payment information
    payment: {
      method: {
        type: String,
        enum: ["credit-card", "debit-card", "cash", "online", "bank-transfer"],
        default: "cash",
      },
      transactionId: {
        type: String,
        default: "",
      },
      paidAmount: {
        type: Number,
        default: 0,
      },
      paymentDate: {
        type: Date,
      },
    },

    // Additional services
    additionalServices: [
      {
        service: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    // Check-in/Check-out details
    checkInTime: {
      type: Date,
    },
    
    checkOutTime: {
      type: Date,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    cancellation: {
      cancelledAt: {
        type: Date,
      },
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reason: {
        type: String,
        default: "",
      },
      refundAmount: {
        type: Number,
        default: 0,
      },
    },

    // Booking notes and history
    notes: {
      type: String,
      default: "",
    },

    bookingSource: {
      type: String,
      enum: ["website", "walk-in", "phone", "agent", "partner"],
      default: "website",
    },

    // Auto-cancellation if not confirmed
    autoCancelAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Pre-save middleware to update room status and user role
bookingSchema.pre('save', async function(next) {
  try {
    const Booking = this.constructor;
    
    // If booking is being confirmed
    if (this.isModified('bookingStatus') && this.bookingStatus === 'confirmed') {
      const Room = mongoose.model('Room');
      const User = mongoose.model('User');
      
      // Update room status to Reserved
      await Room.findByIdAndUpdate(this.room, { 
        status: 'Reserved',
        isAvailable: false 
      });
      
      // Update user role to guest
      await User.findByIdAndUpdate(this.guest, { 
        role: 'guest',
        bookingStatus: 'approved'
      });
    }
    
    // If booking is checked-in
    if (this.isModified('bookingStatus') && this.bookingStatus === 'checked-in') {
      const Room = mongoose.model('Room');
      await Room.findByIdAndUpdate(this.room, { 
        status: 'Occupied' 
      });
    }
    
    // If booking is checked-out or cancelled
    if (this.isModified('bookingStatus') && 
        (this.bookingStatus === 'checked-out' || this.bookingStatus === 'cancelled')) {
      const Room = mongoose.model('Room');
      await Room.findByIdAndUpdate(this.room, { 
        status: 'Vacant',
        isAvailable: true 
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Calculate total nights
bookingSchema.virtual('totalNights').get(function() {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((this.checkOutDate - this.checkInDate) / oneDay));
});

// ✅ Calculate remaining amount
bookingSchema.virtual('remainingAmount').get(function() {
  return this.totalAmount - (this.payment.paidAmount || 0);
});

// ✅ Check if booking is active
bookingSchema.virtual('isActive').get(function() {
  const activeStatuses = ['confirmed', 'checked-in'];
  return activeStatuses.includes(this.bookingStatus);
});

// ✅ Check if booking can be cancelled
bookingSchema.methods.canCancel = function() {
  const cancellableStatuses = ['pending', 'confirmed'];
  return cancellableStatuses.includes(this.bookingStatus);
};

// ✅ Method to calculate total amount
bookingSchema.methods.calculateTotalAmount = function(roomPrice) {
  const nights = this.totalNights;
  const roomTotal = roomPrice * nights;
  
  const servicesTotal = this.additionalServices.reduce((total, service) => {
    return total + (service.price * service.quantity);
  }, 0);
  
  this.totalAmount = roomTotal + servicesTotal;
  return this.totalAmount;
};

// ✅ Static method to find bookings by date range
bookingSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    $or: [
      {
        checkInDate: { $lte: endDate },
        checkOutDate: { $gte: startDate }
      }
    ]
  }).populate('guest room');
};

// ✅ Static method to get occupancy rate for a date
bookingSchema.statics.getOccupancyRate = async function(date) {
  const totalRooms = await mongoose.model('Room').countDocuments();
  const occupiedRooms = await this.countDocuments({
    checkInDate: { $lte: date },
    checkOutDate: { $gt: date },
    bookingStatus: { $in: ['confirmed', 'checked-in'] }
  });
  
  return totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
};

// ✅ Indexes for better performance
bookingSchema.index({ guest: 1 });
bookingSchema.index({ room: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ createdAt: 1 });

export default mongoose.model("Booking", bookingSchema);    