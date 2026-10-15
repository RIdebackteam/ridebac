const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      trim: true,
    },
    sourceLat: { type: Number },
    sourceLng: { type: Number },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    destLat: { type: Number },
    destLng: { type: Number },
    date: {
      type: Date,
      required: [true, 'Ride date is required'],
    },
    time: {
      type: String, // "HH:MM" format
      required: [true, 'Ride time is required'],
    },
    fare: {
      type: Number,
      required: [true, 'Fare per seat is required'],
      min: [0, 'Fare cannot be negative'],
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    // Array of seat indices (0-based) that are booked
    bookedSeats: [
      {
        seatIndex: { type: Number },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    notes: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

// Virtual: available seat count
rideSchema.virtual('availableSeats').get(function () {
  // Seat 0 is always the driver seat — passenger seats start at 1
  return this.totalSeats - 1 - this.bookedSeats.length;
});

// Indexes for search performance
rideSchema.index({ source: 'text', destination: 'text' });
rideSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Ride', rideSchema);
