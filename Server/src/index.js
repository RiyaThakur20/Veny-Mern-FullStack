const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const morgan     = require('morgan');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// ─────────────────────────────────────────────
// 1. GLOBAL MIDDLEWARES
// ─────────────────────────────────────────────

// ✅ Helmet — disable contentSecurityPolicy for dev
// (CSP blocks Cloudinary image URLs in development)
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors());

// ✅ JSON limit 10kb → 50kb (profile data ke liye)
// Note: Images multer handle karta hai — ye limit images pe apply nahi hoti
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

app.use(morgan('dev'));

// Rate Limiting — 100 requests per 15 min per IP
const limiter = rateLimit({
    max:       100,
    windowMs:  15 * 60 * 1000,
    message:   "Too many requests from this IP, please try again in 15 minutes."
});
app.use('/api', limiter);

// ─────────────────────────────────────────────
// 2. ROUTES
// ─────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/profile',  require('./routes/profileRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Health check
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Veny API is running in Orbit... 🚀',
        version: '1.0.0'
    });
});

// ─────────────────────────────────────────────
// 3. ERROR HANDLING
// ─────────────────────────────────────────────

// 404 handler
app.use((req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    err.statusCode = 404;
    next(err);
});

// Global error middleware
app.use(errorHandler);

// ─────────────────────────────────────────────
// 4. START SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server blasting off on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => process.exit(1));
});