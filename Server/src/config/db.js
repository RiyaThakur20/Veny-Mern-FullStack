// import the Mongoose library:
const mongoose = require('mongoose');
const dotenv = require("dotenv");

// Load env config
dotenv.config();

// ConnectDB function
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Agar connect nahi hua toh server band kar do
    }
};

// export the connectDB function:
module.exports = connectDB;