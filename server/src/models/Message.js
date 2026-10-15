const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [1000, 'Message too long'],
    },
    isRead: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
  },
  { timestamps: true }
);

messageSchema.index({ rideId: 1, senderId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
