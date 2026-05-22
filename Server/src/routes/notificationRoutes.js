const express = require('express');
const router  = express.Router();
const {
    getMyNotifications,
    markAllRead,
    markOneRead,
    clearAll
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/',              getMyNotifications);  // GET all
router.patch('/read-all',    markAllRead);          // Mark all read
router.patch('/:id/read',    markOneRead);          // Mark one read
router.delete('/clear',      clearAll);             // Clear all

module.exports = router;