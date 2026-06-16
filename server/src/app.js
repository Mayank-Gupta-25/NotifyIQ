const express = require('express');
const cors = require('cors');
const { CLIENT_URL } = require('./config/env');

const app = express();
// Import routes
const notificationRoutes = require('./routes/notificationRoutes');
const simulatorRoutes = require('./routes/simulatorRoutes');
const digestRoutes = require('./routes/digestRoutes'); 
const ruleRoutes = require('./routes/ruleRoutes');  
const userRoutes = require('./routes/userRoutes'); 
const analyticsRoutes = require('./routes/analyticsRoutes');

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (development)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// TODO: API routes will be added here in Phase 4
app.use('/api/notifications', notificationRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/digests', digestRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/user', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
