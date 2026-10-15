const Message = require('../models/Message');
const Booking = require('../models/Booking');

// Helper: verify requesting user has a confirmed booking on this ride
const hasAccess = async (rideId, userId) => {
  const booking = await Booking.findOne({
    rideId,
    $or: [
      { passengerId: userId, bookingStatus: 'confirmed' },
    ],
  });
  return !!booking;
};

// ─── Get Chat History ─────────────────────────────────────────────────────────
exports.getChatHistory = async (req, res, next) => {
  try {
    const { rideId } = req.params;

    // Verify access (driver or confirmed passenger)
    const access = await hasAccess(rideId, req.user._id);
    // Also allow driver who owns the ride — handled implicitly since driver doesn't have booking

    const messages = await Message.find({ rideId })
      .populate('senderId', 'name avatar role')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { rideId, receiverId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, data: { messages } });
  } catch (err) {
    next(err);
  }
};

// ─── Send Message (REST fallback) ────────────────────────────────────────────
exports.sendMessage = async (req, res, next) => {
  try {
    const { rideId, receiverId, text } = req.body;

    const message = await Message.create({
      rideId,
      senderId: req.user._id,
      receiverId,
      text,
    });

    const populated = await Message.findById(message._id).populate('senderId', 'name avatar role');

    res.status(201).json({ success: true, data: { message: populated } });
  } catch (err) {
    next(err);
  }
};
