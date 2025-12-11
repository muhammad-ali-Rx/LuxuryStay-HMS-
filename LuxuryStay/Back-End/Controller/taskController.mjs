import Task from "../models/Task.mjs"; // Assuming Task model is correctly imported
import Booking from "../models/Booking.mjs"; // Assuming Booking model is correctly imported
import { io } from "../app.mjs";

// Utility function for population settings
const taskPopulationOptions = [
  // Populate the User assigned to the task
  { path: 'assignedTo', select: 'name email' }, 
  // Populate the User who created the task (Admin or Guest)
  { path: 'createdBy', select: 'name email' },
  // Populate the Booking details (only necessary fields)
  { path: 'booking', select: 'roomNumber guest guestDetails.name' }
];

/**
 * @desc Get all tasks (both standalone and booking-related)
 * @route GET /api/tasks/
 * @access Private/Admin, Manager, Receptionist
 */
export const getAllTasks = async (req, res) => {
  try {
    // 💡 Fetch all tasks and populate necessary references
    const tasks = await Task.find({})
      .populate(taskPopulationOptions)
      .sort({ createdAt: -1 }); // Sort by newest tasks first

    // Optionally, if the user ID is populated, you might want to transform the output
    // to present "requestedBy" clearly, but the population is usually sufficient.

    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    res.status(500).json({ success: false, message: "Failed to fetch all tasks.", error: error.message });
  }
};

/**
 * @desc Get tasks associated with a specific booking ID
 * @route GET /api/tasks/booking/:bookingId
 * @access Private/Authenticated User (Guest can see their own tasks, Staff can see all)
 */
export const getBookingTasks = async (req, res) => {
  const { bookingId } = req.params;

  try {
    // 1. Validate if the booking exists (optional but good practice)
    const booking = await Booking.findById(bookingId).select('_id');
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // 2. Find tasks linked to this booking
    const tasks = await Task.find({ booking: bookingId })
      .populate(taskPopulationOptions)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length,
    });

  } catch (error) {
    console.error(`Error fetching tasks for booking ${bookingId}:`, error);
    res.status(500).json({ success: false, message: "Failed to fetch booking tasks.", error: error.message });
  }
};

// 💡 Placeholder for createTask from previous response - include it here
// export const createTask = async (req, res) => {
//   const { title, description, date, assignedTo, booking, roomNumberId } = req.body;

//   if (!title) {
//     return res.status(400).json({ success: false, message: "Task title is required." });
//   }

//   let guestDetails = {};
//   let roomNumber = null;

//   try {
//     // 1. Handle Booking Association (if a booking ID is provided)
//     if (booking) {
//       const parentBooking = await Booking.findById(booking).select('roomNumber guestDetails');
//       if (!parentBooking) {
//         return res.status(404).json({ success: false, message: "Linked booking not found." });
//       }
//       // Embed guest/room details into the task for easy retrieval
//       guestDetails = parentBooking.guestDetails;
//       roomNumber = parentBooking.roomNumber;
//     }

//     // 2. Create the Task
//     const newTask = new Task({
//       title,
//       description,
//       date: date || new Date(),
//       assignedTo,
//       booking,
//       createdBy: req.user._id, // The ID of the logged-in user (Guest or Admin)
//       guestDetails,
//       roomNumber,
//     });

//     await newTask.save();
    
//     // 3. Populate fields for the immediate response
//     await newTask.populate(taskPopulationOptions);

//     // 4. Notification Logic (Placeholder)
//     console.log(`TASK CREATED: ${newTask._id}. Booking ID: ${booking || 'Standalone'}.`);

//     res.status(201).json({
//       success: true,
//       message: "Task successfully created.",
//       task: newTask,
//     });

//   } catch (error) {
//     console.error("Error creating task:", error);
//     res.status(500).json({ success: false, message: "Server error while creating task.", error: error.message });
//   }
// };

export const createTask = async (req, res) => {
  // roomNumberId is the _id of the Room document
  const { title, description, date, assignedTo, booking, roomNumberId } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Task title is required." });
  }

  // New Validation: A task must be linked to a Booking OR a Room ID
  if (!booking && !roomNumberId) {
    return res.status(400).json({ success: false, message: "A task must be linked to a Booking or a Room ID." });
  }

  let guestDetails = {};
  let roomId = roomNumberId; // Default to roomNumberId from body

  try {
    // 1. Handle Booking Association (for Guest Requests)
    if (booking) {
      // Find the booking and select necessary fields
      const parentBooking = await Booking.findById(booking).select('room guestDetails');
      
      if (!parentBooking) {
        return res.status(404).json({ success: false, message: "Linked booking not found." });
      }
      
      // Use the room ID from the booking and embed guest details
      roomId = parentBooking.room; // Assuming Booking model now references the Room _id as 'room'
      guestDetails = parentBooking.guestDetails;

      // Secondary check: Ensure the booking has a room associated
      if (!roomId) {
        return res.status(400).json({ success: false, message: "Linked booking does not have an associated room." });
      }
    } 
    
    // 2. If no booking but a roomNumberId is provided (Admin Task)
    // The roomId is already set to roomNumberId (if it exists)
    if (!roomId) {
        return res.status(400).json({ success: false, message: "A valid Room ID is required." });
    }

    // 3. Create the Task
    const newTask = new Task({
      title,
      description,
      date: date || new Date(),
      assignedTo,
      booking,
      room: roomId, // Link the task to the Room document
      createdBy: req.user._id, 
      guestDetails, // This will be empty for admin tasks without a booking
    });

    await newTask.save();
    
    // 4. Populate fields for the immediate response
    // Ensure taskPopulationOptions includes 'room' and 'booking'
    await newTask.populate(taskPopulationOptions); 

    // 5. Notification Logic (Placeholder)
    console.log(`TASK CREATED: ${newTask._id}. Room ID: ${roomId}.`);
    io.emit('new_task', { message: 'A new task has been created.', task: newTask });

    res.status(201).json({
      success: true,
      message: "Task successfully created.",
      task: newTask,
    });

  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ success: false, message: "Server error while creating task.", error: error.message });
  }
};

// Add updateTask and deleteTask placeholders here if needed for completeness
export const updateTask = async (req, res) => {
  const taskId = req.params.id;
  const updates = req.body;
  
  // Destructure for clarity, including the field we're specifically interested in
  const { assignedTo, status, title, description, date } = updates;

  // Basic validation (optional, but good practice)
  if (!taskId) {
    return res.status(400).json({ success: false, message: "Task ID is required for update." });
  }

  try {
    // 1. Find the task by ID
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    // 2. Apply updates
    // In your case, the frontend is sending { assignedTo: selectedStaffId }
    if (assignedTo) {
      // You may want to validate if assignedTo is a valid User ObjectId and is a staff member
      task.assignedTo = assignedTo;
    }
    if (status) {
      task.status = status;
    }
    if (title) {
      task.title = title;
    }
    if (description) {
      task.description = description;
    }
    if (date) {
      task.date = date;
    }

    // 3. Save the updated task
    const updatedTask = await task.save();

    // 4. Respond with the updated task
    res.status(200).json({ 
      success: true, 
      message: "Task updated successfully.", 
      data: updatedTask 
    });
  } catch (error) {
    console.error("Error updating task:", error.message);
    // Handle validation errors or casting errors (e.g., invalid ObjectId)
    res.status(500).json({ 
      success: false, 
      message: "Failed to update task.", 
      error: error.message 
    });
  }
};

export const deleteTask = (req, res) => res.status(501).json({ success: false, message: "Delete Task not yet implemented" });