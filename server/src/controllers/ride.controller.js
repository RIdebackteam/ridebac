const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const User = require('../models/User');

// ─── Create Ride ──────────────────────────────────────────────────────────────
exports.createRide = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your driver profile before publishing a ride.',
      });
    }

    const {
      source, sourceLat, sourceLng,
      destination, destLat, destLng,
      date, time, fare, totalSeats, notes,
    } = req.body;

    const ride = await Ride.create({
      driverId: driver._id,
      source, sourceLat, sourceLng,
      destination, destLat, destLng,
      date, time, fare, totalSeats,
      notes,
    });

    res.status(201).json({ success: true, data: { ride } });
  } catch (err) {
    next(err);
  }
};

// ─── Search Rides ─────────────────────────────────────────────────────────────
exports.searchRides = async (req, res, next) => {
  try {
    const { from, to, date, seats = 1 } = req.query;

    const query = { status: 'scheduled' };

    if (from) {
      query.source = { $regex: from, $options: 'i' };
    }
    if (to) {
      query.destination = { $regex: to, $options: 'i' };
    }
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const rides = await Ride.find(query)
      .populate({
        path: 'driverId',
        populate: { path: 'userId', select: 'name avatar' },
      })
      .sort({ date: 1, time: 1 });

    // Filter by available seats
    const filtered = rides.filter(
      (r) => r.totalSeats - 1 - r.bookedSeats.length >= Number(seats)
    );

    // Mask driver phone for list view
    const safeRides = filtered.map((r) => {
      const obj = r.toObject({ virtuals: true });
      if (obj.driverId && obj.driverId.userId) {
        delete obj.driverId.userId.phone;
      }
      return obj;
    });

    res.json({ success: true, count: safeRides.length, data: { rides: safeRides } });
  } catch (err) {
    next(err);
  }
};

// ─── Get Ride Detail (with conditional driver contact reveal) ─────────────────
exports.getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id).populate({
      path: 'driverId',
      populate: { path: 'userId', select: 'name avatar phone email' },
    });

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    const obj = ride.toObject({ virtuals: true });

    // Determine if the requesting user has a confirmed booking for this ride
    let hasConfirmedBooking = false;
    if (req.user) {
      const booking = await Booking.findOne({
        rideId: ride._id,
        passengerId: req.user._id,
        bookingStatus: 'confirmed',
      });
      hasConfirmedBooking = !!booking;

      // Also allow the ride's own driver to see full details
      const driverDoc = await Driver.findOne({ userId: req.user._id });
      if (driverDoc && driverDoc._id.toString() === ride.driverId._id.toString()) {
        hasConfirmedBooking = true;
      }
    }

    // Driver privacy: mask phone unless booking confirmed
    if (!hasConfirmedBooking && obj.driverId && obj.driverId.userId) {
      obj.driverId.userId.phone = null;
      obj.driverId.userId.email = null;
    }

    res.json({ success: true, data: { ride: obj, contactRevealed: hasConfirmedBooking } });
  } catch (err) {
    next(err);
  }
};

// ─── Get Seat Layout for a Ride ───────────────────────────────────────────────
exports.getRideSeats = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driverId', 'totalSeats vehicleType');
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    const totalSeats = ride.totalSeats || ride.driverId.totalSeats;
    const bookedIndices = ride.bookedSeats.map((s) => s.seatIndex);

    res.json({
      success: true,
      data: {
        totalSeats,
        bookedSeats: bookedIndices,
        vehicleType: ride.driverId.vehicleType,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Driver's Own Rides ───────────────────────────────────────────────────
exports.getMyRides = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(200).json({ success: true, data: { rides: [] } });
    }

    const rides = await Ride.find({ driverId: driver._id }).sort({ date: -1, createdAt: -1 });
    res.json({ success: true, data: { rides } });
  } catch (err) {
    next(err);
  }
};

// ─── Update Ride ──────────────────────────────────────────────────────────────
exports.updateRide = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    const ride = await Ride.findOne({ _id: req.params.id, driverId: driver._id });

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found or not authorized.' });
    }
    if (ride.bookedSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a ride that has confirmed bookings.',
      });
    }

    const allowedFields = ['source', 'destination', 'date', 'time', 'fare', 'notes',
      'sourceLat', 'sourceLng', 'destLat', 'destLng'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) ride[field] = req.body[field];
    });
    await ride.save();

    res.json({ success: true, data: { ride } });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Ride ──────────────────────────────────────────────────────────────
exports.deleteRide = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    const ride = await Ride.findOne({ _id: req.params.id, driverId: driver._id });

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found or not authorized.' });
    }

    // Cancel any pending bookings
    await Booking.updateMany(
      { rideId: ride._id, bookingStatus: 'pending' },
      { bookingStatus: 'cancelled', cancelledBy: 'driver' }
    );

    ride.status = 'cancelled';
    await ride.save();

    res.json({ success: true, message: 'Ride cancelled successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── Complete Ride ────────────────────────────────────────────────────────────
exports.completeRide = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    const ride = await Ride.findOneAndUpdate(
      { _id: req.params.id, driverId: driver._id, status: 'scheduled' },
      { status: 'completed' },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found or already completed.' });
    }

    // Mark all confirmed bookings as completed
    await Booking.updateMany(
      { rideId: ride._id, bookingStatus: 'confirmed' },
      { bookingStatus: 'completed' }
    );

    // Increment driver totalRides
    await Driver.findByIdAndUpdate(driver._id, { $inc: { totalRides: 1 } });

    res.json({ success: true, data: { ride } });
  } catch (err) {
    next(err);
  }
};
