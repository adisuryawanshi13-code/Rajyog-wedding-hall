import express from 'express';
import {
  getAllBookings,
  getBookedDates,
  reserveBooking,
  verifyBooking,
  cancelBooking
} from '../controllers/bookingController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin Dashboard - Get all bookings
router.get('/admin-all', protect, getAllBookings);

// Public routes
router.get('/booked-dates', getBookedDates);
router.post('/reserve', reserveBooking);
router.post('/verify', verifyBooking);

// Admin route
router.delete('/:id', protect, cancelBooking);

export default router;