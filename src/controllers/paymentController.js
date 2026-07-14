const BookingModel = require('../models/BookingModel');
const StatusCodes = require('../utils/statusCodes');

// Process payment (Mock)
const processPayment = async (req, res) => {
    try {
        const { bookingId, paymentMethod } = req.body;
        const userId = req.user.id;

        if (!bookingId || !paymentMethod) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Booking ID and payment method are required'
            });
        }

        // Check if booking belongs to user
        const belongsToUser = await BookingModel.belongsToUser(bookingId, userId);
        if (!belongsToUser) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Booking not found'
            });
        }

        // Get booking details
        const booking = await BookingModel.findById(bookingId);
        if (!booking) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Booking not found'
            });
        }

        // Mock payment - always success
        const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        // Confirm booking
        await BookingModel.confirm(bookingId, paymentId, paymentMethod);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Payment successful! Booking confirmed.',
            paymentId,
            bookingId
        });

    } catch (error) {
        console.error('Payment error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Payment failed. Please try again.'
        });
    }
};

module.exports = {
    processPayment
};