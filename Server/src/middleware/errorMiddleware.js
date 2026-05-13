// Function to handle all errors centerally
const errorHandler = (err, req, res, next) => {
    // If status code is 200, change it to 500 (Internal Server Error)
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Server Error",
        // Show Error stack only in development mode , not in production
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };