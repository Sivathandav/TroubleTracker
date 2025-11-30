require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hubly CRM API' });
});

// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));

// Ticket routes
app.use('/api/tickets', require('./routes/ticketRoutes'));

// User routes
app.use('/api/users', require('./routes/userRoutes'));

// Analytics routes
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Customization routes
app.use('/api/customization', require('./routes/customizationRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
