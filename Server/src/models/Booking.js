const { Schema, model } = require('mongoose');

const BookingSchema = new Schema({
    service: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    vendor: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    customerLocation: {
        type:        { type: String, default: 'Point', enum: ['Point'] },
        coordinates: { type: [Number] }, // [lng, lat]
        address:     String
    },
    scheduledDate: {
        type: Date,
        required: [true, "Please provide a scheduled date"]
    },
    totalPrice: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// ✅ Bug 6 Fixed: 2dsphere index add kiya
BookingSchema.index({ customerLocation: '2dsphere' });
BookingSchema.index({ vendor: 1, status: 1 });
BookingSchema.index({ customer: 1 });
BookingSchema.index({ scheduledDate: 1 }); // date queries fast hongi

module.exports = model('Booking', BookingSchema);