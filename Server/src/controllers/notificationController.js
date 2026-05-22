const Notification = require('../models/Notification');
const sendEmail    = require('../utils/sendEmail');

// ─────────────────────────────────────────────
// Helper — Create notification + send email
// ─────────────────────────────────────────────
const createNotification = async ({ userId, title, message, type, link, email }) => {
    try {
        // 1. In-app notification save karo
        await Notification.create({ user: userId, title, message, type, link });

        // 2. Email bhi bhejo
        if (email) {
            await sendEmail({
                email,
                subject: `Veny — ${title}`,
                message,
            }).catch(err => console.error("Email notification error:", err.message));
        }
    } catch (error) {
        console.error("Notification creation error:", error.message);
    }
};

// ─────────────────────────────────────────────
// GET — My notifications
// ─────────────────────────────────────────────
const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort('-createdAt')
            .limit(20); // last 20

        const unreadCount = await Notification.countDocuments({
            user:   req.user._id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            unreadCount,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────
// PATCH — Mark all as read
// ─────────────────────────────────────────────
const markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ success: true, msg: "All notifications marked as read" });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────
// PATCH — Mark single as read
// ─────────────────────────────────────────────
const markOneRead = async (req, res, next) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────
// DELETE — Clear all notifications
// ─────────────────────────────────────────────
const clearAll = async (req, res, next) => {
    try {
        await Notification.deleteMany({ user: req.user._id });
        res.status(200).json({ success: true, msg: "All notifications cleared" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createNotification,
    getMyNotifications,
    markAllRead,
    markOneRead,
    clearAll
};