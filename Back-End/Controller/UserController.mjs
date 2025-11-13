import User from '../Models/users.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user can login
    if (!user.canLogin()) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive or not verified',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data (excluding password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bookingStatus: user.bookingStatus,
      phone: user.phone,
      address: user.address,
      profileImage: user.profileImage,
      status: user.status,
      preferences: user.preferences,
      verified: user.verified,
      shift: user.shift,
      salary: user.salary,
      createdBy: user.createdBy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (role) filter.role = role;
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // ✅ FIX: Remove Task population
    const users = await User.find(filter)
      .select('-password')
      .populate('createdBy', 'name email') // Only populate createdBy
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

// Search Users
export const searchUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = req.query;

    let users;
    
    if (id) {
      // Get single user by ID
      const user = await User.findById(id)
        .select('-password')
        .populate('createdBy', 'name email'); // ✅ Remove Task population
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      
      users = [user];
    } else if (query) {
      // Search users by query
      users = await User.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
          { role: { $regex: query, $options: 'i' } },
        ],
      }).select('-password');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Query parameter or user ID is required',
      });
    }

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error.message,
    });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.password;
    delete updates.email; // Email should be updated separately with verification
    delete updates._id;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If role is being updated to staff roles, ensure required fields
    if (updates.role && ['admin', 'general manager', 'manager', 'receptionist', 'housekeeping'].includes(updates.role)) {
      if (!updates.shift) updates.shift = 'flexible';
      if (!updates.salary) updates.salary = 0;
      updates.verified = true; // ✅ Automatically verify staff users
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent self-deletion (optional)
    if (req.user && req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

// Create Staff User (by Admin)
export const createStaffUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, shift, salary } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password and role are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Staff users are automatically verified
    const staffUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: role,
      phone: phone || '',
      shift: shift || 'flexible',
      salary: salary || 0,
      status: 'Active',
      verified: true, // ✅ Staff automatically verified
    });

    await staffUser.save();

    // Return user data without password
    const userData = {
      _id: staffUser._id,
      name: staffUser.name,
      email: staffUser.email,
      role: staffUser.role,
      phone: staffUser.phone,
      shift: staffUser.shift,
      salary: staffUser.salary,
      status: staffUser.status,
      verified: staffUser.verified,
      createdAt: staffUser.createdAt,
      updatedAt: staffUser.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: 'Staff user created successfully',
      data: userData,
    });
  } catch (error) {
    console.error('Create staff user error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create staff user',
      error: error.message,
    });
  }
};

// Update User Role (by Admin)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, shift, salary } = req.body;

    const staffRoles = ["admin", "general manager", "manager", "receptionist", "housekeeping"];
    const updates = { role };

    // If assigning staff role, automatically verify and set shift/salary
    if (staffRoles.includes(role)) {
      updates.verified = true;
      updates.shift = shift || 'flexible';
      updates.salary = salary || 0;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message,
    });
  }
};