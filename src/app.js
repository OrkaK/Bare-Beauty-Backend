const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Bare Beauty API is running');
});

// Routes
app.use('/api', require('./routes/productRoutes'));


module.exports = app;
