const express = require('express');
const router = express.Router();
const { signup , login ,verifyOTP, resendOTP} = require('../controllers/authController');
const { protect , authorize} = require('../middleware/authMiddleware');

// POST /api/auth/signup
//1. Public Routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

//2. Protected Route (only for logged in user)
// Yahan humne 'protect' ko controller se PEHLE lagaya hai
router.get('/profile', protect, (req, res) => {
    res.json({
        success: true,
        msg: "Welcome to your profile!",
        user: req.user // Middleware data
    });
});

// Only Vendors can access this routes
router.post('/add-service', protect, authorize('vendor'), (req, res) => {
    res.json({
        success: true,
        msg: "Vendor access granted! You can now add your service."
    });
});

// if we want a such route who can access both admin and vendor
// router.get('/admin-stats', protect, authorize('admin', 'vendor'), controller);

module.exports = router;