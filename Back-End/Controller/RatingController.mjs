import Room from "../Models/Room.mjs";

// ✅ Add rating to room (1-5 stars only)
export const addRating = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, rating } = req.body;

    console.log("⭐ Adding rating for room:", roomId);
    console.log("👤 User:", userId);
    console.log("🔢 Rating:", rating);

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5 stars"
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // ✅ NEW: Check if user already rated this room
    // Agar aapke paas user ratings ka separate array hai
    if (room.userRatings) {
      const existingRating = room.userRatings.find(
        ur => ur.userId.toString() === userId
      );
      
      if (existingRating) {
        return res.status(400).json({
          message: "You have already rated this room",
          userRating: existingRating.rating
        });
      }
    }

    // ✅ ALTERNATIVE: Agar aap session/localStorage use kar rahe hain
    // To frontend side se check karenge

    // Calculate new average rating
    const currentTotal = room.rating * (room.totalRatings || 0);
    const newTotalRatings = (room.totalRatings || 0) + 1;
    
    // Update rating count for this star
    if (!room.ratingCounts) {
      room.ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }
    room.ratingCounts[rating] = (room.ratingCounts[rating] || 0) + 1;
    
    // Calculate new average
    const newAverage = (currentTotal + rating) / newTotalRatings;

    // Update room
    room.rating = parseFloat(newAverage.toFixed(1));
    room.totalRatings = newTotalRatings;

    // ✅ NEW: Store user rating for future reference
    if (!room.userRatings) {
      room.userRatings = [];
    }
    room.userRatings.push({
      userId: userId,
      rating: rating,
      ratedAt: new Date()
    });

    await room.save();

    console.log("✅ Rating added successfully. New average:", room.rating);

    res.status(200).json({
      message: "Rating submitted successfully",
      room: {
        rating: room.rating,
        totalRatings: room.totalRatings,
        ratingCounts: room.ratingCounts
      },
      userRating: rating // Return user's rating
    });
  } catch (error) {
    console.error("❌ Error adding rating:", error);
    res.status(500).json({
      message: "Error adding rating",
      error: error.message
    });
  }
};

// ✅ Get room rating details including user's rating
export const getRoomRating = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.query; // User ID query parameter se lenge

    const room = await Room.findById(roomId)
      .select('rating totalRatings ratingCounts userRatings');

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Find user's previous rating
    let userRating = 0;
    if (userId && room.userRatings) {
      const userRatingObj = room.userRatings.find(
        ur => ur.userId.toString() === userId
      );
      userRating = userRatingObj ? userRatingObj.rating : 0;
    }

    res.status(200).json({
      rating: room.rating,
      totalRatings: room.totalRatings,
      ratingCounts: room.ratingCounts,
      userRating: userRating
    });
  } catch (error) {
    console.error("❌ Error fetching rating:", error);
    res.status(500).json({
      message: "Error fetching rating",
      error: error.message
    });
  }
};