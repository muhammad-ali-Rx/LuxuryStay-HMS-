import jwt from "jsonwebtoken";
import User from "../Models/users.mjs";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized - No token provided" 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized - Invalid token format" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // ✅ Debugging ke liye

    // ✅ CORRECT USER ID EXTRACTION
    let userId;
    
    if (decoded.userId) {
      // UserController ka token format: { userId }
      userId = decoded.userId;
    } else if (decoded.id) {
      // Dusre format: { id }  
      userId = decoded.id;
    } else {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token payload" 
      });
    }

    // Fetch user from database
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check if user can login
    if (!user.canLogin()) {
      return res.status(401).json({ 
        success: false,
        message: "Account not active or not verified" 
      });
    }

    // Attach user to request
    req.user = user;
    console.log("User authenticated:", user.email); // ✅ Debugging
    
    next();

  } catch (error) {
    console.error("Auth middleware error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired" 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: "Unauthorized", 
      error: error.message 
    });
  }
};

// Role-based authorization middleware
export const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions."
      });
    }
    
    next();
  };
};