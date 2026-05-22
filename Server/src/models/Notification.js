const { Schema, model } = require('mongoose');

const NotificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['booking_new', 'booking_confirmed', 'booking_cancelled', 
               'booking_completed', 'booking_inprogress', 'review_new'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String, // e.g. '/dashboard'
        default: '/dashboard'
    }
}, { timestamps: true });

// Index for fast queries
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = model('Notification', NotificationSchema);