import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    // 👤 Guest Information
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 🍽️ Restaurant
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },

    // 📅 Reservation Details
    reservationDate: {
      type: Date,
      required: true
    },

    reservationTime: {
      type: String,
      required: true
    },

    partySize: {
      type: Number,
      required: true,
      min: 1
    },

    // 📋 Special Requirements
    specialRequests: {
      type: String,
      default: ""
    },

    // 🎯 Occasion Type
    occasion: {
      type: String,
      enum: [
        "none",
        "birthday",
        "anniversary", 
        "business",
        "celebration",
        "romantic",
        "family"
      ],
      default: "none"
    },

    // 💰 Payment Information
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cancelled", "refunded"],
      default: "pending"
    },

    depositAmount: {
      type: Number,
      default: 0
    },

    totalAmount: {
      type: Number,
      default: 0
    },

    // 📊 Status
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled", "completed", "no_show"],
      default: "pending"
    },

    // 🔔 Notifications
    notifications: {
      reminderSent: { type: Boolean, default: false },
      confirmationSent: { type: Boolean, default: false }
    },

    // 👨‍💼 Assigned Table/Staff
    assignedTable: String,
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // 📝 Check-in/Check-out
    checkedIn: {
      type: Boolean,
      default: false
    },

    checkedInAt: Date,
    checkedOutAt: Date,

    // ⭐ Feedback after visit
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      submittedAt: Date
    }

  },
  {
    timestamps: true,
  }
);

// ✅ Virtual for formatted date
reservationSchema.virtual('formattedDate').get(function() {
  return this.reservationDate.toLocaleDateString();
});

// ✅ Index for better query performance
reservationSchema.index({ restaurant: 1, reservationDate: 1 });
reservationSchema.index({ guest: 1, createdAt: -1 });
reservationSchema.index({ status: 1 });

export default mongoose.model("Reservation", reservationSchema);