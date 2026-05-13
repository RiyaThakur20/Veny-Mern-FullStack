const Service = require('../models/Service');
const User    = require('../models/User');
const { cloudinary } = require('../middleware/uploadMiddleware');

/**
 * @desc    Create new service with images
 * @route   POST /api/services/add
 * @access  Private (Vendor Only)
 */
const createService = async (req, res, next) => {
    try {
        const { name, description, price, category, whatsappNumber } = req.body;

        // Vendor ki location DB se auto-attach
        const vendor = await User.findById(req.user._id);
        if (!vendor?.location?.coordinates?.length) {
            return res.status(400).json({
                success: false,
                message: "Vendor location not found. Please update your profile."
            });
        }

        // ✅ Uploaded images process karo
        const images = req.files?.map(file => ({
            url:       file.path,
            public_id: file.filename
        })) || [];

        const service = await Service.create({
            name,
            description,
            price,
            category,
            images,
            whatsappNumber,
            vendor:   req.user._id,
            location: vendor.location
        });

        res.status(201).json({
            success: true,
            message: "Service published successfully",
            data:    service
        });
    } catch (error) {
        console.error("❌ SERVICE CREATE ERROR:", error.message);
        next(error);
    }
};

/**
 * @desc    Get vendor's own services
 * @route   GET /api/services/vendor/my-services
 * @access  Private (Vendor Only)
 */
const getMyServices = async (req, res, next) => {
    try {
        const services = await Service.find({ vendor: req.user._id })
            .select('-__v')
            .sort('-createdAt')
            .lean();

        res.status(200).json({
            success: true,
            count:   services.length,
            data:    services
        });
    } catch (error) {
        console.error("❌ MY-SERVICES ERROR:", error.message);
        next(error);
    }
};

/**
 * @desc    Update service — with image handling
 * @route   PUT /api/services/:id
 * @access  Private (Vendor Only)
 */
const updateService = async (req, res, next) => {
    try {
        let service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        if (service.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Forbidden: You don't own this service" });
        }

        // Strip protected fields
        const { vendor, averageRating, numOfReviews, location, ...safeUpdate } = req.body;

        // ✅ Agar nayi images upload hui hain
        if (req.files && req.files.length > 0) {
            // Purani images Cloudinary se delete karo
            for (const img of service.images) {
                if (img.public_id) {
                    await cloudinary.uploader.destroy(img.public_id);
                }
            }
            // Nayi images set karo
            safeUpdate.images = req.files.map(file => ({
                url:       file.path,
                public_id: file.filename
            }));
        }

        service = await Service.findByIdAndUpdate(req.params.id, safeUpdate, {
            new:          true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: service });
    } catch (error) {
        console.error("❌ UPDATE SERVICE ERROR:", error.message);
        next(error);
    }
};

/**
 * @desc    Delete service + Cloudinary images
 * @route   DELETE /api/services/:id
 * @access  Private (Vendor Only)
 */
const deleteService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        if (service.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Forbidden: You don't own this service" });
        }

        // ✅ Cloudinary se images delete karo
        for (const img of service.images) {
            if (img.public_id) {
                await cloudinary.uploader.destroy(img.public_id);
            }
        }

        await service.deleteOne();

        res.status(200).json({ success: true, message: "Service removed from marketplace" });
    } catch (error) {
        console.error("❌ DELETE SERVICE ERROR:", error.message);
        next(error);
    }
};

/**
 * @desc    Get single service by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
const getServiceById = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('vendor', 'name businessName');

        if (!service || !service.isActive) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        res.status(200).json({ success: true, data: service });
    } catch (error) {
        console.error("❌ GET SERVICE ERROR:", error.message);
        next(error);
    }
};

/**
 * @desc    Get all services with search, filter & pagination
 * @route   GET /api/services
 * @access  Public
 */
const getAllServices = async (req, res, next) => {
    try {
        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        let searchCriteria = JSON.parse(queryStr);
        searchCriteria.isActive = true;

        if (req.query.search) {
            searchCriteria.name = { $regex: req.query.search, $options: 'i' };
        }

        const page  = parseInt(req.query.page,  10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip  = (page - 1) * limit;

        const total = await Service.countDocuments(searchCriteria);

        let query = Service.find(searchCriteria)
            .populate({ path: 'vendor', select: 'name businessName' })
            .skip(skip)
            .limit(limit);

        query = req.query.sort
            ? query.sort(req.query.sort.split(',').join(' '))
            : query.sort('-createdAt');

        const services = await query;

        res.status(200).json({
            success:    true,
            count:      services.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data:       services
        });
    } catch (error) {
        console.error("❌ GET ALL SERVICES ERROR:", error.message);
        next(error);
    }
};

/**
 * @desc    Get nearby services
 * @route   GET /api/services/nearby
 * @access  Public
 */
const getNearbyServices = async (req, res, next) => {
    try {
        const { lng, lat, radius = 5000 } = req.query;

        if (!lng || !lat) {
            return res.status(400).json({ success: false, message: "Please provide lng and lat" });
        }

        const services = await Service.find({
            isActive: true,
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseInt(radius, 10)
                }
            }
        }).populate('vendor', 'name businessName');

        res.status(200).json({ success: true, count: services.length, data: services });
    } catch (error) {
        console.error("❌ NEARBY SERVICES ERROR:", error.message);
        next(error);
    }
};

module.exports = {
    createService,
    getMyServices,
    updateService,
    deleteService,
    getAllServices,
    getNearbyServices,
    getServiceById
};