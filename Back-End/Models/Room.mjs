import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    roomType: {
      type: String,
      enum: ["Standard", "Deluxe", "Suite", "Executive"],
      required: true,
    },

    // 💰 Price set by Admin
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    // 🏠 Current status of room
    status: {
      type: String,
      enum: ["Vacant", "Occupied", "Reserved", "Cleaning", "Maintenance"],
      default: "Vacant",
    },

    // 🖼️ Images of room
    images: {
      type: [String],
      default: [],
    },

    // 🧺 Amenities (for display in UI)
    amenities: {
      type: [String],
      default: ["WiFi", "TV", "AC", "Mini Fridge"],
    },

    // 📜 Description of room
    description: {
      type: String,
      default: "",
    },

    // 📆 Optional: last cleaned date
    lastCleaned: {
      type: Date,
    },

    // 👨‍💼 Which staff/admin added the room
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Room", roomSchema);
