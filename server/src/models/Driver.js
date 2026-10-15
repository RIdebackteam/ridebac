const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vehicleName: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      uppercase: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['hatchback', 'sedan', 'suv', 'mpv'],
      required: [true, 'Vehicle type is required'],
    },
    totalSeats: {
      type: Number,
      required: true,
      // Derived from vehicleType: hatchback=4, sedan=4, suv=6, mpv=7
    },
    vehiclePhoto: { type: String, default: '' },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      trim: true,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRides: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true }, // Auto-approve for MVP
  },
  { timestamps: true }
);

// Virtual: average rating display
driverSchema.virtual('averageRating').get(function () {
  if (this.totalRatings === 0) return 0;
  return (this.rating / this.totalRatings).toFixed(1);
});

// Seat count mapping by vehicle type
driverSchema.statics.getSeatCount = function (vehicleType) {
  const map = { hatchback: 4, sedan: 4, suv: 6, mpv: 7 };
  return map[vehicleType] || 4;
};

module.exports = mongoose.model('Driver', driverSchema);
