const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Cloudinary auto-configure from CLOUDINARY_URL in .env
cloudinary.config();

// ─────────────────────────────────────────────
// Profile Photo Storage
// ─────────────────────────────────────────────
const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:         'veny/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' } // auto face crop
        ],
        public_id: (req, file) => `profile_${req.user._id}_${Date.now()}`,
    },
});

// ─────────────────────────────────────────────
// Service Images Storage
// ─────────────────────────────────────────────
const serviceStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:          'veny/services',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation:  [{ width: 800, height: 600, crop: 'fill' }],
        public_id: (req, file) => `service_${req.user._id}_${Date.now()}`,
    },
});

// File size + type validation
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const uploadProfile = multer({
    storage:   profileStorage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

const uploadServiceImages = multer({
    storage:   serviceStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per image
});

module.exports = { uploadProfile, uploadServiceImages, cloudinary };