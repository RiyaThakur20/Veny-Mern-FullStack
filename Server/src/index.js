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

// ✅ Trust proxy — Render/Railway ke peeche proxy hota hai
// Ye rate-limit aur IP detection ke liye zaroori hai
app.set('trust proxy', 1);

// ─────────────────────────────────────────────
// 1. GLOBAL MIDDLEWARES
// ─────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ✅ CORS — Vercel frontend allow karo
app.use(cors({
    origin: [
        'http://localhost:5173',           // local dev
        process.env.FRONTEND_URL,          // Vercel URL from env
    ].filter(Boolean),
    credentials: true
}));

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(morgan('dev'));

// ✅ Rate Limiting — trust proxy ke baad define karo
const limiter = rateLimit({
    max:       100,
    windowMs:  15 * 60 * 1000,
    message:   "Too many requests from this IP, please try again in 15 minutes.",
    standardHeaders: true,
    legacyHeaders:   false,
});
app.use('/api', limiter);

// ─────────────────────────────────────────────
// 2. ROUTES
// ─────────────────────────────────────────────
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/services',      require('./routes/serviceRoutes'));
app.use('/api/bookings',      require('./routes/bookingRoutes'));
app.use('/api/profile',       require('./routes/profileRoutes'));
app.use('/api/reviews',       require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

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
app.use((req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    err.statusCode = 404;
    next(err);
});

app.use(errorHandler);

// ─────────────────────────────────────────────
// 4. START SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server blasting off on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => process.exit(1));
});