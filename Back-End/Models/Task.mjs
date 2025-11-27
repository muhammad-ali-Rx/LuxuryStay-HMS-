// models/Task.js (New File)

import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: Date,
      // Consider making this required for a task due date
    },

    // 🌟 New Fields for Context and Flexibility 🌟

    // This links the task back to a specific Booking (Optional)
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false, // Key change: allows standalone tasks
    },

    // This field tracks who created the task (Admin or Guest)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
    
    // Add a field to track the guest/room details if it's a booking task, 
    // to avoid an extra lookup (Optional, but useful for display)
    guestDetails: {
      name: String,
      roomNumber: String,
    }
  },
  {
    timestamps: true,
  }
);

// ✅ Add indexes for common queries
taskSchema.index({ booking: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });

export default mongoose.model("Task", taskSchema);