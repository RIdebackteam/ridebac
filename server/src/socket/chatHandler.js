const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');

/**
 * Verify JWT from socket handshake and return decoded user id.
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

/**
 * Check if a user is allowed to join a ride's chat room.
 * Allowed: confirmed passenger OR the ride's driver.
 */
const canJoinRoom = async (rideId, userId) => {
  const ride = await Ride.findById(rideId).populate('driverId', 'userId');
  if (!ride) return false;

  // Driver check
  const driver = await Driver.findOne({ userId });
  if (driver && ride.driverId._id.toString() === driver._id.toString()) return true;

  // Confirmed passenger check
  const booking = await Booking.findOne({
    rideId,
    passengerId: userId,
    bookingStatus: 'confirmed',
  });
  return !!booking;
};

module.exports = (io) => {
  io.on('connection', async (socket) => {
    const token = socket.handshake.auth?.token;
    const decoded = verifyToken(token);

    if (!decoded) {
      socket.emit('error', { message: 'Unauthorized' });
      socket.disconnect();
      return;
    }

    const userId = decoded.id;
    socket.userId = userId;

    console.log(`[Socket] User ${userId} connected: ${socket.id}`);

    // ── Join Ride Chat Room ──────────────────────────────────────────────────
    socket.on('join-room', async ({ rideId }) => {
      const allowed = await canJoinRoom(rideId, userId);
      if (!allowed) {
        socket.emit('error', { message: 'Not authorized to join this chat room.' });
        return;
      }
      socket.join(`ride:${rideId}`);
      socket.emit('joined-room', { rideId });
      console.log(`[Socket] User ${userId} joined room ride:${rideId}`);
    });

    // ── Send Message ─────────────────────────────────────────────────────────
    socket.on('send-message', async ({ rideId, receiverId, text }) => {
      try {
        const message = await Message.create({
          rideId,
          senderId: userId,
          receiverId,
          text,
        });

        const populated = await Message.findById(message._id)
          .populate('senderId', 'name avatar role');

        // Broadcast to everyone in the room (including sender for confirmation)
        io.to(`ride:${rideId}`).emit('new-message', populated);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    // ── Typing Indicator ─────────────────────────────────────────────────────
    socket.on('typing', ({ rideId, isTyping }) => {
      socket.to(`ride:${rideId}`).emit('user-typing', { userId, isTyping });
    });

    // ── Mark Read ────────────────────────────────────────────────────────────
    socket.on('mark-read', async ({ rideId }) => {
      await Message.updateMany(
        { rideId, receiverId: userId, isRead: false },
        { isRead: true }
      );
      socket.to(`ride:${rideId}`).emit('messages-read', { userId });
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Socket] User ${userId} disconnected: ${socket.id}`);
    });
  });
};
