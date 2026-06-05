const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// ✅ Bug 3 Fixed: role bhi token mein include karo
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '24h',
    });
};

// ─────────────────────────────────────────────
// 1. SIGNUP
// ─────────────────────────────────────────────
const signup = async (req, res, next) => {
    try {
        const { name, email, password, role, location, businessName } = req.body;

        if (!location?.coordinates?.length) {
            return res.status(400).json({ success: false, msg: "Location is required" });
        }
        if (role === 'vendor' && !businessName?.trim()) {
            return res.status(400).json({ success: false, msg: "Business name is required for vendors" });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, msg: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            businessName: role === 'vendor' ? businessName : undefined,
            location,
            otp,
            otpExpires,
            isVerified: false,
        });

        await user.save();

        // ✅ sendEmail hata diya — EmailJS frontend se bhejega
        res.status(201).json({
            success: true,
            msg: "Account created! OTP sent to your email for verification.",
            otp: otp, // 👈 Frontend ko OTP do
        });

    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────
// 2. LOGIN
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ success: false, msg: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, msg: "Invalid credentials" });
        }
        if (!user.isVerified) {
            return res.status(403).json({ success: false, msg: "Please verify your email first." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await User.findByIdAndUpdate(user._id, { $set: { otp, otpExpires } });

        // ✅ sendEmail hata diya — OTP frontend ko do
        res.status(200).json({
            success: true,
            msg: "OTP sent to your registered email.",
            otp:  otp,          // 👈 yeh add kiya
            name: user.name,    // 👈 EmailJS ke liye
        });

    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────
// 3. VERIFY OTP
// ─────────────────────────────────────────────
const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email }).select('+otp +otpExpires');

        if (!user || !user.otp) {
            return res.status(400).json({ success: false, msg: "OTP not found or already used." });
        }

        const isOtpMatch = String(user.otp) === String(otp);
        const isExpired  = user.otpExpires < Date.now();

        if (!isOtpMatch || isExpired) {
            return res.status(400).json({
                success: false,
                msg: isExpired ? "OTP has expired. Please login again." : "Invalid OTP."
            });
        }

        // ✅ Bug 3 Fixed: role bhi token mein daal do
        const token = generateToken(user._id, user.role);

        await User.findByIdAndUpdate(user._id, {
            $set: { otp: null, otpExpires: null, isVerified: true }
        });

        res.status(200).json({
            success: true,
            msg: "Verification successful! Welcome to Veny 🚀",
            token,
            user: {
                id:       user._id,
                name:     user.name,
                role:     user.role,
                email:    user.email,
                location: user.location,  // ✅ Dashboard map ke liye
            }
        });

    } catch (error) {
        next(error);
    }
};


// ─────────────────────────────────────────────
// 4. RESEND OTP
// ─────────────────────────────────────────────
const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, msg: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await User.findByIdAndUpdate(user._id, { $set: { otp, otpExpires } });

        await sendEmail({
            email: user.email,
            subject: 'Your New Veny OTP',
            message: `Your new OTP is: ${otp}\nValid for 10 minutes.`,
        });

        res.status(200).json({ success: true, msg: "New OTP sent!" });
    } catch (error) {
        next(error);
    }
};

module.exports = { signup, login, verifyOTP, resendOTP };