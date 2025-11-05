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
      enum: ["admin", "manager", "receptionist", "housekeeping", "user", "guest"],
      default: "user", // by default, normal registered user
    },

    bookingStatus: {
      type: String,
      enum: ["none", "pending", "approved"],
      default: "none", // none = no booking yet
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
  } else if (bookingStatus === "pending") {
    this.role = "user";
  } else if (bookingStatus === "none") {
    this.role = "user";
  }

  await this.save();
};

const User = mongoose.model("User", userSchema);
export default User;
