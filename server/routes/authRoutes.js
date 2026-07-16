import express from 'express';
import { registerAdmin, loginAdmin, getAdminProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for creating a new admin user (POST /api/auth/register)
router.post('/register', registerAdmin);

// Route for authenticating an existing admin user (POST /api/auth/login)
router.post('/login', loginAdmin);

// Secure route to fetch current logged-in user profile (GET /api/auth/profile)
// Uses the 'protect' middleware to guarantee a valid JWT is present before calling getAdminProfile
router.get('/profile', protect, getAdminProfile);

export default router;