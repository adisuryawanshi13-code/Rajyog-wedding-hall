import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the raw token string from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify the token signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_royal_key_rajyog_2026');

      // Fetch user data associated with token ID and exclude the password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authorization failed. User record no longer exists.' });
      }

      // Proceed to the next middleware or controller
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ success: false, message: 'Session expired or token is invalid. Please log in again.' });
    }
  }

  // If no token was found at all
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. Security token missing from headers.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // If the authenticated user does not have a allowed role, reject immediately
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden. Your current role (${req.user?.role || 'Guest'}) does not have permission to perform this action.` 
      });
    }
    next();
  };
};