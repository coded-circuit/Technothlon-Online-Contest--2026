const express = require('express');
const cors = require('cors');

const router = express.Router();

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://technothlon.techniche.org.in'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

router.use(cors(corsOptions));



module.exports = router;