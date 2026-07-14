const BookingModel = require('../models/BookingModel');
const UserModel = require('../models/UserModel');
const StatusCodes = require('../utils/statusCodes');

// ✅ BOOK SEATS
const bookSeats = async (req, res) => {
    try {
        const { showId, seatIds } = req.body;
        const userId = req.user.id;

        if (!showId || !seatIds || seatIds.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Show ID and seat IDs are required'
            });
        }

        try {
            const result = await BookingModel.createBookingWithSeats(
                userId, showId, seatIds
            );

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: 'Seats booked! Complete payment.',
                bookingId: result.bookingId,
                bookingReference: result.bookingRef,
                totalAmount: result.totalAmount,
                seats: result.seats,
                expiresIn: '10 minutes'
            });

        } catch (error) {
            throw error;
        }

    } catch (error) {
        console.error('Booking error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: error.message || 'Booking failed'
        });
    }
};

// ✅ CONFIRM BOOKING
const confirmBooking = async (req, res) => {
    try {
        const { bookingId, paymentId, paymentMethod } = req.body;
        const userId = req.user.id;

        if (!bookingId || !paymentId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Booking ID and payment ID are required'
            });
        }

        const belongsToUser = await BookingModel.belongsToUser(bookingId, userId);
        if (!belongsToUser) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Booking not found'
            });
        }

        const confirmed = await BookingModel.confirm(bookingId, paymentId, paymentMethod);
        if (!confirmed) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Failed to confirm booking'
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Booking confirmed! 🎉'
        });

    } catch (error) {
        console.error('Confirm booking error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to confirm booking'
        });
    }
};

// ✅ GET USER BOOKINGS
const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        const bookings = await BookingModel.getByUser(
            userId, 
            status, 
            parseInt(page), 
            parseInt(limit)
        );

        return res.status(StatusCodes.OK).json({
            success: true,
            ...bookings
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to get bookings'
        });
    }
};

// ✅ CANCEL BOOKING
const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;

        const belongsToUser = await BookingModel.belongsToUser(bookingId, userId);
        if (!belongsToUser) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Booking not found'
            });
        }

        const booking = await BookingModel.findById(bookingId);
        if (!booking) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Booking not found'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Booking already cancelled'
            });
        }

        const showTime = new Date(booking.start_time);
        const now = new Date();
        const hoursUntilShow = (showTime - now) / (1000 * 60 * 60);

        let refundAmount = 0;
        let refundMessage = '';

        if (hoursUntilShow > 24) {
            refundAmount = booking.total_amount * 0.9;
            refundMessage = '90% refund';
        } else if (hoursUntilShow > 12) {
            refundAmount = booking.total_amount * 0.7;
            refundMessage = '70% refund';
        } else if (hoursUntilShow > 4) {
            refundAmount = booking.total_amount * 0.5;
            refundMessage = '50% refund';
        } else {
            refundAmount = 0;
            refundMessage = 'No refund (less than 4 hours)';
        }

        await BookingModel.cancel(bookingId);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Booking cancelled',
            refundAmount,
            refundMessage,
            totalAmount: booking.total_amount
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to cancel booking'
        });
    }
};

module.exports = {
    bookSeats,
    confirmBooking,
    getUserBookings,
    cancelBooking
};