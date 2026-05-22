const Booking  = require('../models/Booking');
const Service  = require('../models/Service');
const User     = require('../models/User');
const { createNotification } = require('./notificationController');

const VALID_STATUSES = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

// ─────────────────────────────────────────────
// 1. CREATE BOOKING
// ─────────────────────────────────────────────
const createBooking = async (req, res, next) => {
    try {
        const { serviceId, scheduledDate, address } = req.body;

        const service = await Service.findById(serviceId).populate('vendor');
        if (!service) {
            return res.status(404).json({ success: false, msg: "Service not found" });
        }
        if (!service.isActive) {
            return res.status(400).json({ success: false, msg: "This service is currently unavailable" });
        }
        if (service.vendor._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, msg: "You cannot book your own service" });
        }

        const customer = await User.findById(req.user._id);
        if (!customer.location?.coordinates) {
            return res.status(400).json({ success: false, msg: "Please update your location in profile first" });
        }

        const newBooking = new Booking({
            service:   serviceId,
            customer:  req.user._id,
            vendor:    service.vendor._id,
            totalPrice: service.price,
            scheduledDate,
            customerLocation: {
                type:        'Point',
                coordinates: customer.location.coordinates,
                address:     address || customer.address
            }
        });

        await newBooking.save();

        // ✅ Vendor ko notification — naya booking aaya
        const vendor = await User.findById(service.vendor._id);
        await createNotification({
            userId:  service.vendor._id,
            title:   "New Booking Request! 🌌",
            message: `${customer.name} ne "${service.name}" ke liye booking ki hai. Date: ${new Date(scheduledDate).toLocaleDateString()}`,
            type:    'booking_new',
            link:    '/dashboard',
            email:   vendor?.email
        });

        res.status(201).json({
            success: true,
            msg:     "Booking Request Sent! 🌌",
            booking: newBooking
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────
// 2. GET MY BOOKINGS
// ─────────────────────────────────────────────
const getMyBookings = async (req, res, next) => {
    try {
        const query = req.user.role === 'vendor'
            ? { vendor: req.user._id }
            : { customer: req.user._id };

        const bookings = await Booking.find(query)
            .populate('service',  'name category price images')
            .populate('customer', 'name email phoneNumber')
            .populate('vendor',   'name email businessName whatsappNumber')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: bookings.length, bookings });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────
// 3. UPDATE STATUS
// ─────────────────────────────────────────────
const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                msg: `Invalid status. Must be: ${VALID_STATUSES.join(', ')}`
            });
        }

        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('vendor',   'name email businessName')
            .populate('service',  'name');

        if (!booking) {
            return res.status(404).json({ success: false, msg: "Booking not found" });
        }

        const isVendor   = booking.vendor._id.toString() === req.user._id.toString();
        const isCustomer = booking.customer._id.toString() === req.user._id.toString();

        if (!isVendor && !isCustomer) {
            return res.status(403).json({ success: false, msg: "Access Denied" });
        }

        // Customer sirf cancel kar sakta hai
        if (isCustomer) {
            if (status !== 'cancelled') {
                return res.status(403).json({ success: false, msg: "Customers can only cancel bookings" });
            }
            if (!['pending', 'confirmed'].includes(booking.status)) {
                return res.status(400).json({ success: false, msg: "Cannot cancel at this stage" });
            }
        }

        // Vendor status flow
        if (isVendor) {
            const validTransitions = {
                pending:       ['confirmed', 'cancelled'],
                confirmed:     ['in-progress', 'cancelled'],
                'in-progress': ['completed'],
                completed:     [],
                cancelled:     []
            };
            if (!validTransitions[booking.status]?.includes(status)) {
                return res.status(400).json({
                    success: false,
                    msg: `Cannot change from "${booking.status}" to "${status}"`
                });
            }
        }

        booking.status = status;
        await booking.save();

        // ✅ Notifications based on status change
        const notifMap = {
            confirmed: {
                userId:  booking.customer._id,
                title:   "Booking Confirmed! ✅",
                message: `${booking.vendor.businessName || booking.vendor.name} ne "${booking.service.name}" booking confirm kar di!`,
                type:    'booking_confirmed',
                email:   booking.customer.email
            },
            cancelled: {
                // Agar vendor ne cancel kiya toh customer ko, agar customer ne toh vendor ko
                userId:  isVendor ? booking.customer._id : booking.vendor._id,
                title:   "Booking Cancelled ❌",
                message: isVendor
                    ? `"${booking.service.name}" booking vendor ne cancel kar di.`
                    : `Customer ne "${booking.service.name}" booking cancel kar di.`,
                type:    'booking_cancelled',
                email:   isVendor ? booking.customer.email : booking.vendor.email
            },
            'in-progress': {
                userId:  booking.customer._id,
                title:   "Service Started! 🚀",
                message: `"${booking.service.name}" service shuru ho gayi hai!`,
                type:    'booking_inprogress',
                email:   booking.customer.email
            },
            completed: {
                userId:  booking.customer._id,
                title:   "Service Completed! 🎉",
                message: `"${booking.service.name}" complete ho gayi! Review zaroor do.`,
                type:    'booking_completed',
                link:    `/service/${booking.service._id}`,
                email:   booking.customer.email
            }
        };

        if (notifMap[status]) {
            await createNotification({
                ...notifMap[status],
                link: notifMap[status].link || '/dashboard'
            });
        }

        res.status(200).json({
            success: true,
            msg:     `Status updated to "${status}" ✨`,
            booking
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createBooking, getMyBookings, updateStatus };