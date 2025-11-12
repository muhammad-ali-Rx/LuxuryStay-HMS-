import mongoose from "mongoose";
import bcrypt from 'bcryptjs'; // ✅ ADD THIS IMPORT

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
        "general manager",
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
      default: "Active",
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

// ✅ ADD THIS: Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// ✅ ADD THIS: Password hashing before save
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ ADD THIS: Method to check if user can login
userSchema.methods.canLogin = function() {
  return this.status === 'Active' && this.verified;
};

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