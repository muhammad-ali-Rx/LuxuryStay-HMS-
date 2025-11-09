import Room from "../Models/Room.mjs";

// ✅ Create a new room
export const createRoom = async (req, res) => {
  try {
    console.log("📸 Files received:", req.files);
    console.log("📦 Body received:", req.body);

    const {
      roomNumber,
      roomType,
      pricePerNight,
      description,
      createdBy,
      capacity,
      rating,
      reviewsCount,
    } = req.body;

    // FIX: Handle amenities properly
    let amenities = [];
    if (req.body.amenities) {
      // If amenities is an array (from form-data with multiple fields)
      if (Array.isArray(req.body.amenities)) {
        amenities = req.body.amenities;
      } 
      // If amenities is a string (could be JSON stringified)
      else if (typeof req.body.amenities === 'string') {
        try {
          const parsed = JSON.parse(req.body.amenities);
          amenities = Array.isArray(parsed) ? parsed : [req.body.amenities];
        } catch (e) {
          // If parsing fails, treat as single amenity
          amenities = [req.body.amenities];
        }
      }
    }

    console.log("🛏️ Processed amenities:", amenities);

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        message: "Room number already exists",
        error: "Duplicate room number",
        roomNumber: roomNumber,
      });
    }

    // 🔹 Collect image URLs from Cloudinary
    const images = req.files?.map((file) => file.path) || [];

    // 🏨 Create room instance
    const room = new Room({
      roomNumber,
      roomType,
      pricePerNight,
      images,
      amenities, // Now properly formatted as array
      description,
      createdBy,
      capacity: capacity ? Number(capacity) : 2,
      rating: rating ? Number(rating) : 0,
      reviewsCount: reviewsCount ? Number(reviewsCount) : 0,
    });

    await room.save();
    console.log("✅ Room saved:", room);

    res.status(201).json({ message: "Room added successfully!", room });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      message: "Error adding room",
      error: error.message,
    });
  }
};

// ✅ Update room details
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📦 Update body received:", req.body);

    let {
      roomNumber,
      roomType,
      pricePerNight,
      description,
      status,
      capacity,
      rating,
      reviewsCount,
    } = req.body;

    // FIX: Handle amenities properly for update - including empty arrays
    let amenities = [];
    if (req.body.amenities !== undefined) {
      if (Array.isArray(req.body.amenities)) {
        amenities = req.body.amenities;
      } else if (typeof req.body.amenities === 'string') {
        try {
          const parsed = JSON.parse(req.body.amenities);
          amenities = Array.isArray(parsed) ? parsed : [req.body.amenities];
        } catch (e) {
          amenities = req.body.amenities ? [req.body.amenities] : [];
        }
      }
    }
    // If amenities is explicitly provided (even empty), we should update it
    const hasAmenitiesInRequest = req.body.amenities !== undefined;

    console.log("🛏️ Processed amenities for update:", amenities);
    console.log("📋 Has amenities in request:", hasAmenitiesInRequest);

    if (roomNumber) {
      const existingRoom = await Room.findOne({ 
        roomNumber,
        _id: { $ne: id }
      });
      if (existingRoom) {
        return res.status(400).json({
          message: "Room number already exists",
          error: "Duplicate room number",
          roomNumber: roomNumber,
        });
      }
    }

    // If images are uploaded again
    const images = req.files?.map((file) => file.path);

    const updateData = {
      ...(roomNumber && { roomNumber }),
      ...(roomType && { roomType }),
      ...(pricePerNight && { pricePerNight }),
      ...(description && { description }),
      ...(status && { status }),
      ...(capacity && { capacity }),
      ...(rating && { rating }),
      ...(reviewsCount && { reviewsCount }),
    };

    // FIX: Always update amenities if provided in request (even if empty)
    if (hasAmenitiesInRequest) {
      updateData.amenities = amenities;
    }

    if (images && images.length > 0) {
      updateData.images = images;
    }

    console.log("🔄 Final update data:", updateData);

    const room = await Room.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!room)
      return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ message: "Room updated successfully", room });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      message: "Error updating room",
      error: error.message,
    });
  }
};


// ✅ Get all rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching rooms",
      error: error.message,
    });
  }
};

// ✅ Get single room by ID
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching room",
      error: error.message,
    });
  }
};

// ✅ Delete room
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByIdAndDelete(id);
    if (!room)
      return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting room",
      error: error.message,
    });
  }
};

// ✅ Change Room Status (Vacant / Cleaning / Maintenance)
export const updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const room = await Room.findById(id);
    if (!room)
      return res.status(404).json({ message: "Room not found" });

    room.status = status;
    await room.save();

    res.status(200).json({ message: "Room status updated", room });
  } catch (error) {
    res.status(500).json({
      message: "Error updating status",
      error: error.message,
    });
  }
};
