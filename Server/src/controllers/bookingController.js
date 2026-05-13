const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User    = require('../models/User');

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

        // Service active hai ya nahi
        if (!service.isActive) {
            return res.status(400).json({ success: false, msg: "This service is currently unavailable" });
        }

        // Vendor apni khud ki service book na kar sake
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
// 2. GET MY BOOKINGS (Customer + Vendor)
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

        // Valid status check
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                msg: `Invalid status. Must be: ${VALID_STATUSES.join(', ')}`
            });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, msg: "Booking not found" });
        }

        const isVendor   = booking.vendor.toString()   === req.user._id.toString();
        const isCustomer = booking.customer.toString() === req.user._id.toString();

        // Na vendor na customer — access denied
        if (!isVendor && !isCustomer) {
            return res.status(403).json({ success: false, msg: "Access Denied" });
        }

        // ✅ Customer sirf cancel kar sakta hai — pending ya confirmed pe
        if (isCustomer) {
            if (status !== 'cancelled') {
                return res.status(403).json({
                    success: false,
                    msg: "Customers can only cancel bookings"
                });
            }
            if (!['pending', 'confirmed'].includes(booking.status)) {
                return res.status(400).json({
                    success: false,
                    msg: "Cannot cancel a booking that is already in progress, completed or cancelled"
                });
            }
        }

        // ✅ Vendor status flow check — logical order enforce karo
        if (isVendor) {
            const validTransitions = {
                pending:      ['confirmed', 'cancelled'],
                confirmed:    ['in-progress', 'cancelled'],
                'in-progress':['completed'],
                completed:    [],
                cancelled:    []
            };

            if (!validTransitions[booking.status]?.includes(status)) {
                return res.status(400).json({
                    success: false,
                    msg: `Cannot change status from "${booking.status}" to "${status}"`
                });
            }
        }

        booking.status = status;
        await booking.save();

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