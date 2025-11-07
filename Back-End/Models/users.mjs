import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: [
        "admin",
        "manager",
        "receptionist",
        "housekeeping",
        "user",
        "guest",
      ],
      default: "user",
    },

    bookingStatus: {
      type: String,
      enum: ["none", "pending", "approved"],
      default: "none",
    },

    phone: {
      type: String,
    },

    address: {
      type: String,
    },

    profileImage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    preferences: {
      type: String, // e.g., "Non-smoking room, Sea view"
    },

    verified: {
      type: Boolean,
      default: false, // false = not verified yet
    },

    shift: {
      type: String,
      enum: ["morning", "afternoon", "night", "flexible"],
      default: "flexible",
    },

    salary: {
      type: Number,
      default: 0,
    },

    assignedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.updateRoleOnBooking = async function (bookingStatus) {
  this.bookingStatus = bookingStatus;

  if (bookingStatus === "approved") {
    this.role = "guest";
  } else if (bookingStatus === "pending" || bookingStatus === "none") {
    this.role = "user";
  }

  await this.save();
};

const User = mongoose.model("User", userSchema);
export default User;
