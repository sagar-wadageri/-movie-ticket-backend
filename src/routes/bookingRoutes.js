const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

// All booking routes require authentication
router.post('/book', authenticate, bookingController.bookSeats);
router.post('/confirm', authenticate, bookingController.confirmBooking);
router.get('/my-bookings', authenticate, bookingController.getUserBookings);
router.delete('/:bookingId', authenticate, bookingController.cancelBooking);

module.exports = router;