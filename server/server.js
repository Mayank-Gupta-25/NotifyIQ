const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const { PORT, NODE_ENV } = require('./src/config/env');

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Create HTTP server (needed for Socket.io)
  const httpServer = http.createServer(app);

  // Initialize Socket.io
  initSocket(httpServer);

  // Start listening
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
    console.log(`📡 API:    http://localhost:${PORT}/api/health`);
    console.log(`🔌 Socket: http://localhost:${PORT}`);
    console.log('');
  });
};

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
