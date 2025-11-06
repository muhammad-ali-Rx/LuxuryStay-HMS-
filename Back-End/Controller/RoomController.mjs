import Room from "../Models/Room.mjs";

export const createRoom = async (req, res) => {
  try {
    console.log("Files received:", req.files); // 👈 Add this line

    const {
      roomNumber,
      roomType,
      pricePerNight,
      amenities = [],
      description,
      createdBy,
    } = req.body;

    const images = req.files?.map((file) => file.path) || [];

    const room = new Room({
      roomNumber,
      roomType,
      pricePerNight,
      images,
      amenities,
      description,
      createdBy,
    });

    await room.save();
    console.log("✅ Room saved:", room);
    res.status(201).json({ message: "Room added successfully!", room });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Error adding room", error: error.message });
  }
};



// ✅ Get all rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms", error: error.message });
  }
};

// ✅ Get single room by ID
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Error fetching room", error: error.message });
  }
};

// ✅ Update room details (Admin can change price or status)
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const room = await Room.findByIdAndUpdate(id, updates, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ message: "Room updated successfully", room });
  } catch (error) {
    res.status(500).json({ message: "Error updating room", error: error.message });
  }
};

// ✅ Delete room
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByIdAndDelete(id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting room", error: error.message });
  }
};

// ✅ Change Room Status (Vacant / Cleaning / Maintenance)
export const updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    room.status = status;
    await room.save();

    res.status(200).json({ message: "Room status updated", room });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};
