const express = require('express');
const router  = express.Router();

const { getProfile, updateProfile, updateProfilePhoto } = require('../controllers/profileController');
const { protect }        = require('../middleware/authMiddleware');
const { uploadProfile }  = require('../middleware/uploadMiddleware');

// All profile routes require login
router.use(protect);

// GET  /api/profile        — get my profile
// PUT  /api/profile        — update name, businessName, phone
// POST /api/profile/photo  — update profile photo
router.get('/',      getProfile);
router.put('/',      updateProfile);
router.post('/photo', uploadProfile.single('profilePhoto'), updateProfilePhoto);

module.exports = router;