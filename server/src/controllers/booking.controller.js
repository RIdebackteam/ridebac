const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');

// ─── Book a Seat ──────────────────────────────────────────────────────────────
exports.createBooking = async (req, res, next) => {
  try {
    const { rideId, seatIndex } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }
    if (ride.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: 'Ride is no longer available.' });
    }

    // Ensure seat is not already booked
    const isBooked = ride.bookedSeats.some((s) => s.seatIndex === Number(seatIndex));
    if (isBooked) {
      return res.status(409).json({ success: false, message: 'Seat already booked. Please choose another.' });
    }

    // Check passenger doesn't already have a booking on this ride
    const existingBooking = await Booking.findOne({
      rideId,
      passengerId: req.user._id,
      bookingStatus: { $in: ['pending', 'confirmed'] },
    });
    if (existingBooking) {
      return res.status(409).json({ success: false, message: 'You already have a booking on this ride.' });
    }

    const booking = await Booking.create({
      rideId,
      passengerId: req.user._id,
      seatIndex: Number(seatIndex),
      fare: ride.fare,
      bookingStatus: 'pending',
      paymentStatus: 'pending',
    });

    res.status(201).json({ success: true, data: { booking } });
  } catch (err) {
    next(err);
  }
};

// ─── Simulate Payment + Confirm Booking ───────────────────────────────────────
exports.payAndConfirm = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      passengerId: req.user._id,
      bookingStatus: 'pending',
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or already processed.' });
    }

    // Simulate payment success
    const fakeRef = `RB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    booking.paymentStatus = 'paid';
    booking.paymentRef = fakeRef;
    booking.bookingStatus = 'confirmed';
    await booking.save();

    // Lock the seat in the ride document
    await Ride.findByIdAndUpdate(booking.rideId, {
      $push: { bookedSeats: { seatIndex: booking.seatIndex, bookingId: booking._id } },
    });

    const populated = await Booking.findById(booking._id)
      .populate('rideId')
      .populate('passengerId', 'name email phone avatar');

    res.json({ success: true, data: { booking: populated, paymentRef: fakeRef } });
  } catch (err) {
    next(err);
  }
};

// ─── Get My Bookings (Passenger) ──────────────────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ passengerId: req.user._id })
      .populate({
        path: 'rideId',
        populate: {
          path: 'driverId',
          populate: { path: 'userId', select: 'name avatar phone' },
        },
      })
      .sort({ createdAt: -1 });

    // Mask driver phone for non-confirmed bookings
    const safe = bookings.map((b) => {
      const obj = b.toObject();
      if (obj.bookingStatus !== 'confirmed' && obj.rideId?.driverId?.userId) {
        obj.rideId.driverId.userId.phone = null;
      }
      return obj;
    });

    res.json({ success: true, data: { bookings: safe } });
  } catch (err) {
    next(err);
  }
};

// ─── Cancel Booking (Passenger) ───────────────────────────────────────────────
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      passengerId: req.user._id,
      bookingStatus: { $in: ['pending', 'confirmed'] },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or already cancelled.' });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancelledBy = 'passenger';
    booking.cancellationReason = req.body.reason || '';
    await booking.save();

    // Free up the seat
    await Ride.findByIdAndUpdate(booking.rideId, {
      $pull: { bookedSeats: { seatIndex: booking.seatIndex } },
    });

    res.json({ success: true, message: 'Booking cancelled.', data: { booking } });
  } catch (err) {
    next(err);
  }
};

// ─── Accept Booking (Driver) ──────────────────────────────────────────────────
exports.acceptBooking = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) return res.status(403).json({ success: false, message: 'Driver profile required.' });

    const ride = await Ride.findOne({ _id: (await Booking.findById(req.params.id))?.rideId, driverId: driver._id });
    if (!ride) return res.status(403).json({ success: false, message: 'Not authorized.' });

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: 'confirmed' },
      { new: true }
    );

    res.json({ success: true, data: { booking } });
  } catch (err) {
    next(err);
  }
};

// ─── Reject Booking (Driver) ──────────────────────────────────────────────────
exports.rejectBooking = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const ride = await Ride.findOne({ _id: booking.rideId, driverId: driver._id });
    if (!ride) return res.status(403).json({ success: false, message: 'Not authorized.' });

    booking.bookingStatus = 'rejected';
    booking.cancelledBy = 'driver';
    booking.cancellationReason = req.body.reason || '';
    await booking.save();

    // Free the seat
    await Ride.findByIdAndUpdate(booking.rideId, {
      $pull: { bookedSeats: { seatIndex: booking.seatIndex } },
    });

    res.json({ success: true, data: { booking } });
  } catch (err) {
    next(err);
  }
};

// ─── Rate Driver ──────────────────────────────────────────────────────────────
exports.rateDriver = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findOne({
      _id: req.params.id,
      passengerId: req.user._id,
      bookingStatus: 'completed',
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Completed booking not found.' });
    }
    if (booking.rating) {
      return res.status(400).json({ success: false, message: 'Already rated.' });
    }

    booking.rating = rating;
    booking.review = review || '';
    await booking.save();

    // Update driver aggregate rating
    const ride = await Ride.findById(booking.rideId);
    await Driver.findByIdAndUpdate(ride.driverId, {
      $inc: { rating: Number(rating), totalRatings: 1 },
    });

    res.json({ success: true, message: 'Rating submitted.' });
  } catch (err) {
    next(err);
  }
};
