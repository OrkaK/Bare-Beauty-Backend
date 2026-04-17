require('dotenv').config(); // Trigger restart again
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.static('src/uploads')); // Serve uploads
app.use(cors({
    origin: true, // Frontend URL dynamically allowed
    credentials: true
}));

// Stripe Webhook needs RAW body parsing before express.json()
app.use('/webhook/stripe', express.raw({type: 'application/json'}), require('./routes/webhookRoutes'));

// Swagger UI Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(require('cookie-parser')());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bare-beauty', {
    //   useNewUrlParser: true, // Deprecated in newer mongoose versions but harmless
    //   useUnifiedTopology: true 
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Basic Route
app.get('/', (req, res) => {
    res.send('Bare Beauty API is running');
});

// Routes
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const miscRoutes = require('./routes/miscRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/', productRoutes);
app.use('/', reviewRoutes);
app.use('/', cartRoutes);
app.use('/', orderRoutes);
app.use('/', miscRoutes);
app.use('/auth', authRoutes);
app.use('/api', require('./routes/uploadRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Global Error Handler must be mounted after routes
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
