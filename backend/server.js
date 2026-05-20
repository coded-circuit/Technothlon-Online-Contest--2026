const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const EventEmitter = require('events');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const technopediaRoutes = require('./routes/Technopedia_Route');

// Configure event emitter
EventEmitter.defaultMaxListeners = 20;
process.setMaxListeners(20);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',  // React dev server
  'http://localhost:3001',  // Backend server
  'http://localhost:5173',  // Vite default
  'https://technothlon.techniche.org.in',
  // Add any other production URLs
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS`);
      callback(null, true); // Still allow it for now, but log it
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Apply CORS before any routes
app.use(cors(corsOptions));

// For preflight requests
app.options('*', cors(corsOptions));
app.use('/api/technopedia', technopediaRoutes);
// Root route
app.get('/', (req, res) => {
    res.send("Hello from Technothlon Server");
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server Started on port http://localhost:${PORT}`));
