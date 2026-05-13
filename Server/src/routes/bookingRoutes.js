const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, updateStatus } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware'); 

router.post('/create', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.patch('/update/:id', protect, updateStatus);

module.exports = router;