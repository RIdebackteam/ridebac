require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const app = require('./src/app');
const chatHandler = require('./src/socket/chatHandler');
const { startCleanupJobs } = require('./src/jobs/rideCleanup.job');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ─── HTTP Server + Socket.IO ──────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach Socket.IO chat handlers
chatHandler(io);

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  MongoDB connected');

    server.listen(PORT, () => {
      console.log(`🚗  RideBack server running on http://localhost:${PORT}`);
      // Start scheduled cleanup jobs only after DB is ready
      startCleanupJobs();
    });
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

startServer();

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  server.close(() => process.exit(1));
});
