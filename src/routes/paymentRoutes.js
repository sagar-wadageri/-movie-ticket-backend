const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, paymentController.processPayment);

module.exports = router;