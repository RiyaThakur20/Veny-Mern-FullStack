const express = require('express');
const router  = express.Router();
const { createReview, getServiceReviews, deleteReview, canReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public — reviews dekhna
router.get('/service/:serviceId', getServiceReviews);

// Protected — review dena, delete karna, check karna
router.use(protect);
router.post('/',                        createReview);
router.get('/can-review/:serviceId',    canReview);
router.delete('/:id',                   deleteReview);

module.exports = router;