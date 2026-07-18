import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Booking from './models/Booking.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
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
app.use('/api/bookings', bookingRoutes);

app.listen(PORT, () => {
  console.log(`Rajyog Backend System running on http://localhost:${PORT}`);
});