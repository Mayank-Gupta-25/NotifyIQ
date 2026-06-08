const { Server } = require('socket.io');
const { CLIENT_URL } = require('./env');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Ping-pong test
    socket.on('ping', (callback) => {
      console.log(`📡 Ping from ${socket.id}`);
      if (typeof callback === 'function') {
        callback({ status: 'pong', timestamp: new Date().toISOString() });
      }
    });

    // Focus mode change
    socket.on('focus:changed', (data) => {
      console.log(`🎯 Focus mode changed: ${data.mode}`);
      socket.emit('focus:confirmed', { mode: data.mode });
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ Client disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log('🔌 Socket.io initialized');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket first.');
  }
  return io;
};

module.exports = { initSocket, getIO };
