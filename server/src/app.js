const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const driverRoutes = require('./routes/driver.routes');
const rideRoutes = require('./routes/ride.routes');
const bookingRoutes = require('./routes/booking.routes');
const messageRoutes = require('./routes/message.routes');
const paymentRoutes = require('./routes/payment.routes');
const errorHandler = require('./middleware/error.middleware');
const { runCleanupNow } = require('./jobs/rideCleanup.job');

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static File Serving (vehicle uploads) ────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'RideBack API is running 🚗' });
});

// ─── Admin: Manual Cleanup Trigger (for testing) ──────────────────────────────
// Protected by a simple secret header — set ADMIN_SECRET in .env
app.post('/api/admin/cleanup', async (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    await runCleanupNow();
    res.json({ success: true, message: 'Cleanup completed. Check server logs for details.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
