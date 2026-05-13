const { Schema, model } = require('mongoose');
const Service = require('./Service');

const ReviewSchema = new Schema({
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
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, "Review cannot exceed 500 characters"]
    }
}, { timestamps: true });

// ✅ Ek customer ek service pe sirf ek review
ReviewSchema.index({ service: 1, customer: 1 }, { unique: true });

// ✅ Auto-update averageRating in Service after save/delete
ReviewSchema.statics.updateAverageRating = async function (serviceId) {
    const result = await this.aggregate([
        { $match: { service: serviceId } },
        { $group: { _id: '$service', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    await Service.findByIdAndUpdate(serviceId, {
        averageRating: result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0,
        numOfReviews:  result.length > 0 ? result[0].count : 0
    });
};

ReviewSchema.post('save', function () {
    this.constructor.updateAverageRating(this.service);
});

ReviewSchema.post('deleteOne', { document: true }, function () {
    this.constructor.updateAverageRating(this.service);
});

module.exports = model('Review', ReviewSchema);