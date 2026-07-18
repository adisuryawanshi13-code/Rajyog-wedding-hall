import Booking from '../models/Booking.js';

/**
 * @desc    Get all bookings (For Secure Admin Dashboard View)
 * @route   GET /api/bookings/admin-all
 * @access  Private/Admin
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ eventDate: 1 });
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve all bookings from the ledger database.',
      error: error.message
    });
  }
};

/**
 * @desc    Get completed booked dates (For calendar rendering)
 * @route   GET /api/bookings/booked-dates
 * @access  Public
 */
export const getBookedDates = async (req, res) => {
  try {
    const bookings = await Booking.find({ paymentStatus: 'Completed' }, 'eventDate');
    const dbBookedDates = bookings.map(b => b.eventDate);
    
    // Maintain our original baseline mock holidays (3, 8, 12, 19, 24) combined with live database dates
    const mockBooked = [3, 8, 12, 19, 24];
    const uniqueBookedDates = Array.from(new Set([...mockBooked, ...dbBookedDates]));
    
    res.status(200).json({
      success: true,
      bookedDates: uniqueBookedDates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booked dates',
      error: error.message
    });
  }
};

/**
 * @desc    Reserve a temporary pending date
 * @route   POST /api/bookings/reserve
 * @access  Public
 */
export const reserveBooking = async (req, res) => {
  try {
    const { name, email, phone, eventDate, guests, packageSelected } = req.body;

    if (!name || !email || !phone || !eventDate || !guests || !packageSelected) {
      return res.status(400).json({ success: false, message: 'Please provide all reservation details.' });
    }

    const mockBooked = [3, 8, 12, 19, 24];
    const isDateUnavailable = mockBooked.includes(Number(eventDate)) || 
      await Booking.findOne({ eventDate: Number(eventDate), paymentStatus: 'Completed' });

    if (isDateUnavailable) {
      return res.status(400).json({ success: false, message: 'The selected date is already booked. Please choose another date.' });
    }

    const mockTransactionId = 'TXN-' + Math.random().toString(36).substring(2, 11).toUpperCase();

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
};

/**
 * @desc    Verify payment and finalize reservation
 * @route   POST /api/bookings/verify
 * @access  Public
 */
export const verifyBooking = async (req, res) => {
  try {
    const { bookingId, transactionId } = req.body;

    if (!bookingId || !transactionId) {
      return res.status(400).json({ success: false, message: 'Missing transaction references.' });
    }

    const confirmedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus: 'Completed', transactionId },
      { new: true }
    );

    if (!confirmedBooking) {
      return res.status(404).json({ success: false, message: 'Reservation reference not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and reservation finalized!',
      booking: confirmedBooking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Payment verification failed', error: error.message });
  }
};

/**
 * @desc    Delete/Cancel a booking
 * @route   DELETE /api/bookings/:id
 * @access  Private/Admin
 */
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No booking found with this ID.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking canceled successfully and removed from ledger.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel reservation.',
      error: error.message
    });
  }
};