/* STREAMING_CHUNK: Defining the Mongoose Schema for luxury booking data validation */
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, '10-digit contact number is required'],
    match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number'],
  },
  eventDate: {
    type: Number, // Storing selected day (1-30) for November 2026
    required: [true, 'Preferred wedding date is required'],
  },
  guests: {
    type: Number,
    required: [true, 'Expected guest capacity is required'],
    enum: [500, 1500, 3000],
  },
  packageSelected: {
    type: String,
    required: [true, 'Event package selection is required'],
    enum: ['The Maharaja Suite', 'The Shahi Vivah', 'The Great Reception'],
  },
  depositAmount: {
    type: Number,
    default: 150000, // Matching the ₹1,50,000 estimate on the invoice
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending',
  },
  transactionId: {
    type: String,
    unique: true,
  }
}, {
  timestamps: true, // Automatically track booking creation dates
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;