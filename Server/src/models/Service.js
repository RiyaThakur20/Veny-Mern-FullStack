const { Schema, model } = require('mongoose');

const serviceSchema = new Schema({
    name: {
        type: String,
        required: [true, "Service name is required"],
        trim: true,
        maxlength: [100, "Name is too long"]
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        maxlength: [500, "Description is too long"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: {
            values: ['Cleaning', 'Repair', 'Salon', 'Electrician', 'Plumber', 'Cooking'],
            message: '{VALUE} is not a valid category'
        }
    },
    images: [
        {
            url: { type: String, required: true },
            public_id: { type: String }
        }
    ],
    vendor: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],          // [longitude, latitude] — MongoDB rule
            required: [true, "Location coordinates are required"]
        },
        address: {
            type: String,
            required: false          // ✅ Optional — auto-filled via reverse geocoding
        }
    },

    whatsappNumber: {
        type: String,
        required: [true, "Contact number is required for booking"]
    },

    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Spatial index for "Near Me" queries
serviceSchema.index({ location: "2dsphere" });
serviceSchema.index({ category: 1, price: 1 });

module.exports = model('Service', serviceSchema);