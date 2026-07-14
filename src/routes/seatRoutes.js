const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

// Get seats for a show
router.get('/show/:showId', seatController.getSeatsByShow);

module.exports = router;