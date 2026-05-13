const { Schema, model } = require('mongoose');
const validator = require('validator');

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide your name"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters"],
        maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false
    },
    role: {
        type: String,
        enum: { values: ['customer', 'vendor'], message: '{VALUE} is not a valid role' },
        default: 'customer'
    },
    businessName: {
        type: String,
        trim: true,
        required: function () { return this.role === 'vendor'; }
    },

    // ✅ Profile Photo — Cloudinary
    profilePhoto: {
        url:       { type: String, default: '' },
        public_id: { type: String, default: '' }
    },

    location: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: [true, "Location coordinates are required"]
        }
    },
    address: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    otp: {
        type: String,
        select: false
    },
    otpExpires: {
        type: Date,
        select: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

UserSchema.index({ location: '2dsphere' });

const User = model('user', UserSchema);
module.exports = User;