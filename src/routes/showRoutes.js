const express = require('express');
const router = express.Router();
const showController = require('../controllers/showController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/movie/:movieId', showController.getShowsByMovie);
router.get('/:id', showController.getShowById);

// Admin only routes
router.post('/', authenticate, isAdmin, showController.createShow);

module.exports = router;