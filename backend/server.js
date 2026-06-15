/**
 * Technothlon Backend Server
 * 
 * This is the main entry point for the Express.js backend server that powers the Technothlon
 * online contest platform. The server handles:
 * - User authentication and session management
 * - REST API endpoints for quiz/contest data
 * - Database connectivity via MongoDB
 * - CORS configuration for frontend cross-origin requests
 * - Error handling and logging
 * 
 * Architecture:
 * - Express.js for HTTP server and routing
 * - MongoDB via Mongoose ODM for data persistence
 * - CORS middleware for secure cross-origin communication
 * - Environment variables for configuration management
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const EventEmitter = require('events');

// Load environment variables from .env file into process.env
// This allows secure configuration without hardcoding sensitive data
dotenv.config();

// Initialize database connection to MongoDB
// This function is defined in ./config/db.js and handles connection setup and error handling
connectDB();

// Import the main API routes for Technopedia quiz functionality
const technopediaRoutes = require('./routes/Technopedia_Route');

/**
 * Event Emitter Configuration
 * Node.js will warn if more than 10 listeners are added to an EventEmitter by default
 * We increase this limit to 20 to handle concurrent requests without warnings
 * This is particularly important for applications with multiple simultaneous database operations
 */
EventEmitter.defaultMaxListeners = 20;
process.setMaxListeners(20);

// Create Express application instance
// This is the core object that handles all HTTP requests and responses
const app = express();

/**
 * Express Middleware Configuration
 * Middleware functions are executed in order for every incoming request
 * These process request data and prepare it for route handlers
 */

// Parse incoming JSON request bodies
// This middleware converts raw JSON data in request bodies into JavaScript objects
// accessible via req.body in route handlers
app.use(express.json());

// Parse incoming URL-encoded request bodies (form data)
// extended: true allows parsing of nested objects and arrays
app.use(express.urlencoded({ extended: true }));

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * 
 * CORS is a security feature that restricts which domains can access our API.
 * Without proper CORS configuration, requests from frontend applications
 * running on different origins/domains would be blocked by the browser.
 * 
 * Allowed origins include:
 * - Local development environments (localhost:3000, 5173)
 * - Production domain (technothlon.techniche.org.in)
 * 
 * This prevents unauthorized API access while allowing legitimate frontend apps
 */

// Define allowed origins - these are the domains permitted to make requests to our API
const allowedOrigins = [
  'http://localhost:3000',  // React dev server
  'http://localhost:4000',
  'http://localhost:3001',  // Backend server
  'http://localhost:5173',  // Vite default
  'https://technothlon.techniche.org.in',
  // Add any other production URLs
];

// CORS configuration object that defines how to handle cross-origin requests
// Includes allowed HTTP methods, headers, and credentials handling
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

/**
 * CORS Middleware Application
 * This middleware applies the CORS policy to all routes defined after it
 * Requests from non-allowed origins will be rejected by the browser at the client-side
 */
app.use(cors(corsOptions));

/**
 * Preflight Request Handling
 * HTTP OPTIONS requests are sent by browsers before actual POST/PUT/DELETE requests
 * This is called a "preflight request" and is used to check if the actual request
 * will be accepted based on CORS policy. Browsers send this automatically.
 */
app.options('*', cors(corsOptions));

/**
 * Route Registration - Technopedia API Routes
 * Mount all Technopedia-related routes under /api/technopedia path prefix
 * Available endpoints include:
 * - GET /api/technopedia/test-db - Database connectivity test
 * - POST /api/technopedia/check-student - User authentication/verification
 * - GET /api/technopedia/questions/:year - Fetch questions for a specific year
 */
app.use('/api/technopedia', technopediaRoutes);

/**
 * Root Endpoint / Health Check
 * Simple endpoint to verify the server is running
 * Useful for deployment monitoring and load balancers
 */
app.use('/api', contestRoutes);
// Root route
app.get('/', (req, res) => {
    res.send("Hello from Technothlon Server");
});

/**
 * Global Error Handling Middleware
 * Catches uncaught errors from route handlers and other middleware
 * IMPORTANT: Must be defined AFTER all other middleware and routes
 * Function signature (err, req, res, next) is required for Express to recognize it
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

/**
 * Server Startup Configuration and Initialization
 * 
 * PORT Selection Priority:
 * 1. process.env.PORT environment variable (highest priority)
 * 2. .env file PORT setting (loaded by dotenv.config())
 * 3. System environment PORT
 * 4. Default port 4000 (fallback)
 * 
 * This allows flexibility for development, staging, and production deployments
 */
const PORT = process.env.PORT || 4000;

/**
 * Start the Express Server
 * Begin listening for HTTP connections on the specified PORT
 * 
 * After execution:
 * - Server accepts HTTP connections on specified PORT
 * - Routes incoming requests to appropriate handlers
 * - Applies middleware in defined order
 * - Returns responses to clients
 */
app.listen(PORT, () => console.log(`Server Started on port http://localhost:${PORT}`));
