const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const showRoutes = require('./routes/showRoutes');
const seatRoutes = require('./routes/seatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/payment', paymentRoutes);




// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Movie Ticket Booking API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

module.exports = app;