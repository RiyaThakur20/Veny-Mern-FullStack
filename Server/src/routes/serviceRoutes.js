const express = require('express');
const router  = express.Router();

const {
    createService, getMyServices, updateService,
    deleteService, getAllServices, getNearbyServices, getServiceById
} = require('../controllers/serviceController');

const { protect, authorize }        = require('../middleware/authMiddleware');
const { uploadServiceImages }       = require('../middleware/uploadMiddleware');

// ═══════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════
router.get('/',       getAllServices);
router.get('/nearby', getNearbyServices);
router.get('/:id',    getServiceById);

// ═══════════════════════════════════════════════
// PROTECTED — Login required
// ═══════════════════════════════════════════════
router.use(protect);

// ✅ Permanent fix — /vendor/my-services — /:id se kabhi conflict nahi
router.get('/vendor/my-services', getMyServices);

// ═══════════════════════════════════════════════
// VENDOR ONLY
// ═══════════════════════════════════════════════
router.use(authorize('vendor'));

// ✅ Images upload — max 4 images per service
router.post('/add', uploadServiceImages.array('images', 4), createService);

router.route('/:id')
    .put(uploadServiceImages.array('images', 4), updateService)
    .delete(deleteService);

module.exports = router;