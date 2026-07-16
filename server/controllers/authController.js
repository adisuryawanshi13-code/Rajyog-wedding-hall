import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper function to generate a secure JWT signed token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_royal_key_rajyog_2026', {
    expiresIn: '30d', // Session valid for 30 days
  });
};

export const registerAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if the user already exists in MongoDB
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Admin user already exists with this email or username.' });
    }

    // Create the new administrator record (password is auto-hashed in User model schema hook)
    const user = await User.create({
      username,
      email,
      password,
      role
    });

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid admin account details provided.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Admin registration failure', error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Validate the credentials using comparePassword schema method
    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server login error', error: error.message });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    // req.user is dynamically set by the authMiddleware we will create next
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        success: true,
        user,
      });
    } else {
      res.status(404).json({ success: false, message: 'Admin user not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Profile fetch error', error: error.message });
  }
};