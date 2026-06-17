const mongoose = require("mongoose");
const dotenv = require('dotenv');

dotenv.config();


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        //Add your database into .env file by making a .env file in backend.
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.log(`Error: ${error.message}`);
        console.log('MongoDB unavailable. Starting server with local dry-run fallback routes.');
    }
};

module.exports = connectDB;
