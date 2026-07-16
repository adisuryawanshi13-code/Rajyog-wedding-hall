import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Booking from './models/Booking.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable cross-origin resource sharing so your React frontend can safely communicate with this backend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174'
  ],
  credentials: true
}));

// Express middleware to parse incoming JSON bodies automatically
app.use(express.json());

// Establish connection to MongoDB
connectDB();

// All routes inside authRoutes.js will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

app.get('/api/bookings/booked-dates', async (req, res) => {
  try {
    // Fetch all completed bookings
    const bookings = await Booking.find({ paymentStatus: 'Completed' }, 'eventDate');
    const dbBookedDates = bookings.map(b => b.eventDate);
    
    // Combine our standard baseline holidays from the mockup design (3, 8, 12, 19, 24) with database bookings
    const mockBooked = [3, 8, 12, 19, 24];
    const uniqueBookedDates = Array.from(new Set([...mockBooked, ...dbBookedDates]));
    
    res.json({ success: true, bookedDates: uniqueBookedDates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve booked dates', error: error.message });
  }
});

app.post('/api/bookings/reserve', async (req, res) => {
  try {
    const { name, email, phone, eventDate, guests, packageSelected } = req.body;

    // Validate request body details
    if (!name || !email || !phone || !eventDate || !guests || !packageSelected) {
      return res.status(400).json({ success: false, message: 'Please provide all reservation details.' });
    }

    // Check if the requested date is already booked in MongoDB or baseline array
    const mockBooked = [3, 8, 12, 19, 24];
    const isDateUnavailable = mockBooked.includes(Number(eventDate)) || 
      await Booking.findOne({ eventDate: Number(eventDate), paymentStatus: 'Completed' });

    if (isDateUnavailable) {
      return res.status(400).json({ success: false, message: 'The selected date is already booked. Please choose another date.' });
    }

    // Generate a unique transaction tracking key
    const mockTransactionId = 'TXN-' + Math.random().toString(36).substring(2, 11).toUpperCase();

    // Create entry in MongoDB with "Pending" status until payment is finalized
    const newBooking = new Booking({
      name,
      email,
      phone,
      eventDate: Number(eventDate),
      guests: Number(guests),
      packageSelected,
      depositAmount: 150000,
      paymentStatus: 'Pending',
      transactionId: mockTransactionId
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      bookingId: savedBooking._id,
      transactionId: mockTransactionId,
      depositAmount: 150000
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server reservation error', error: error.message });
  }
});

app.post('/api/bookings/verify', async (req, res) => {
  try {
    const { bookingId, transactionId } = req.body;

    if (!bookingId || !transactionId) {
      return res.status(400).json({ success: false, message: 'Missing transaction references.' });
    }

    // Find the pending reservation and update its status to completed
    const confirmedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus: 'Completed', transactionId },
      { new: true }
    );

    if (!confirmedBooking) {
      return res.status(404).json({ success: false, message: 'Reservation reference not found.' });
    }

    res.json({
      success: true,
      message: 'Payment verified and reservation finalized!',
      booking: confirmedBooking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Payment verification failed', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Rajyog Backend System running on http://localhost:${PORT}`);
});