const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seatIndex: {
      type: Number,
      required: [true, 'Seat index is required'],
    },
    fare: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'rejected', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentRef: { type: String, default: '' },

// Razorpay payment details
razorpayOrderId: { type: String, default: '' },
razorpayPaymentId: { type: String, default: '' },
razorpaySignature: { type: String, default: '' },

    cancelledBy: { type: String, enum: ['passenger', 'driver', ''] , default: '' },
    cancellationReason: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

// Index for efficient lookups
bookingSchema.index({ rideId: 1, passengerId: 1 });
bookingSchema.index({ passengerId: 1, bookingStatus: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
