const User = require('../models/User');
const { cloudinary } = require('../middleware/uploadMiddleware');

// ─────────────────────────────────────────────
// GET Profile
// ─────────────────────────────────────────────
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password -otp -otpExpires');
        if (!user) return res.status(404).json({ success: false, msg: "User not found" });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────
// UPDATE Profile (name, businessName, phoneNumber)
// ─────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
    try {
        const { name, businessName, phoneNumber } = req.body;

        const allowedUpdates = { name, businessName, phoneNumber };

        // Remove undefined fields
        Object.keys(allowedUpdates).forEach(
            key => allowedUpdates[key] === undefined && delete allowedUpdates[key]
        );

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        ).select('-password -otp -otpExpires');

        res.status(200).json({
            success: true,
            msg: "Profile updated successfully!",
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────
// UPDATE Profile Photo
// ─────────────────────────────────────────────
const updateProfilePhoto = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, msg: "Please upload an image" });
        }

        const user = await User.findById(req.user._id);

        // Delete old photo from Cloudinary if exists
        if (user.profilePhoto?.public_id) {
            await cloudinary.uploader.destroy(user.profilePhoto.public_id);
        }

        // Save new photo
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    profilePhoto: {
                        url:       req.file.path,
                        public_id: req.file.filename,
                    }
                }
            },
            { new: true }
        ).select('-password -otp -otpExpires');

        res.status(200).json({
            success: true,
            msg: "Profile photo updated!",
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, updateProfile, updateProfilePhoto };