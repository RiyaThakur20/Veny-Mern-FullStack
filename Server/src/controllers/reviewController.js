const Review  = require('../models/Review');
const Booking = require('../models/Booking');

// ─────────────────────────────────────────────
// 1. CREATE REVIEW
// ─────────────────────────────────────────────
const createReview = async (req, res, next) => {
    try {
        const { serviceId, rating, comment } = req.body;

        // Check: customer ne is service ki completed booking ki hai?
        const booking = await Booking.findOne({
            service:  serviceId,
            customer: req.user._id,
            status:   'completed'
        });

        if (!booking) {
            return res.status(403).json({
                success: false,
                msg: "You can only review services you have completed."
            });
        }

        // Check: already review diya hai?
        const existing = await Review.findOne({
            service:  serviceId,
            customer: req.user._id
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                msg: "You have already reviewed this service."
            });
        }

        const review = await Review.create({
            service:  serviceId,
            customer: req.user._id,
            rating,
            comment
        });

        await review.populate('customer', 'name profilePhoto');

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────
// 2. GET REVIEWS FOR A SERVICE
// ─────────────────────────────────────────────
const getServiceReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ service: req.params.serviceId })
            .populate('customer', 'name profilePhoto')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: reviews.length,
            data:  reviews
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────
// 3. DELETE REVIEW (owner only)
// ─────────────────────────────────────────────
const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, msg: "Review not found" });
        }

        if (review.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, msg: "You can only delete your own review" });
        }

        await review.deleteOne();

        res.status(200).json({ success: true, msg: "Review deleted" });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────
// 4. CHECK IF USER CAN REVIEW
// ─────────────────────────────────────────────
const canReview = async (req, res, next) => {
    try {
        const { serviceId } = req.params;

        const booking = await Booking.findOne({
            service:  serviceId,
            customer: req.user._id,
            status:   'completed'
        });

        const existing = await Review.findOne({
            service:  serviceId,
            customer: req.user._id
        });

        res.status(200).json({
            success:       true,
            canReview:     !!booking && !existing,
            hasReviewed:   !!existing,
            hasBooking:    !!booking,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createReview, getServiceReviews, deleteReview, canReview };