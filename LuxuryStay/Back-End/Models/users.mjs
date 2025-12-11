import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
    assignedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    status: {
      type: String,
      enum: ["Active", "inactive"],
      default: "Active", // ✅ Changed to lowercase
    },

    preferences: {
      type: String,
    },

    verified: {
      type: Boolean,
      default: false,
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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Password hashing before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ FIXED: Method to check if user can login
userSchema.methods.canLogin = function () {
  // Staff roles that don't need email verification
  const staffRoles = [
    "admin",
    "general manager",
    "manager",
    "receptionist",
    "housekeeping",
  ];

  if (staffRoles.includes(this.role)) {
    return this.status === "Active"; // Staff only need active status
  }

  // Regular users need both active status and verification
  return this.status === "Active" && this.verified;
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
