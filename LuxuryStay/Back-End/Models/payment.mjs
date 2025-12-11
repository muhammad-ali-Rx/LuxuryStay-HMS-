import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Guest Information
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  guestEmail: {
    type: String,
    required: [true, 'Guest email is required'],
    trim: true,
    lowercase: true
  },
  guestPhone: {
    type: String,
    required: [true, 'Guest phone is required'],
    trim: true
  },
  guestAddress: {
    type: String,
    required: [true, 'Guest address is required'],
    trim: true
  },
  
  // Booking Information
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    trim: true
  },
  checkIn: {
    type: String,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: String,
    required: [true, 'Check-out date is required']
  },
  nights: {
    type: Number,
    required: [true, 'Number of nights is required'],
    min: 1
  },
  
  // Payment Information
  roomRate: {
    type: Number,
    required: [true, 'Room rate is required'],
    min: 0
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: 0
  },
  paid: {
    type: Number,
    default: 0,
    min: 0
  },
  pending: {
    type: Number,
    default: function() {
      return Math.max(0, this.subtotal - (this.paid || 0));
    },
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partially-paid', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Additional Information
  staff: {
    type: String,
    default: 'System Admin'
  },
  specialRequests: {
    type: String,
    default: 'No special requests'
  },
  
  // Notes and History
  notes: [{
    message: String,
    date: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: String,
      default: 'System'
    }
  }],
  
  // Reference to original booking (if available)
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }
}, {
  timestamps: true
});

// Auto-calculate pending amount before saving
paymentSchema.pre('save', function(next) {
  if (this.isModified('paid') || this.isModified('subtotal')) {
    this.pending = Math.max(0, this.subtotal - this.paid);
    
    // Auto-update payment status based on amounts
    if (this.paid >= this.subtotal) {
      this.paymentStatus = 'paid';
    } else if (this.paid > 0) {
      this.paymentStatus = 'partially-paid';
    } else {
      this.paymentStatus = 'pending';
    }
  }
  next();
});

// Static method to get billing statistics
paymentSchema.statics.getBillingStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$subtotal' },
        totalPaid: { $sum: '$paid' },
        totalPending: { $sum: '$pending' },
        totalBookings: { $sum: 1 },
        paidBookings: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
        },
        pendingBookings: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    totalBookings: 0,
    paidBookings: 0,
    pendingBookings: 0
  };
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;