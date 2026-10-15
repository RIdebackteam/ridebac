const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');

// ─── Create / Update Driver Profile ──────────────────────────────────────────
exports.upsertProfile = async (req, res, next) => {
  try {
    const { vehicleName, vehicleNumber, vehicleType, licenseNumber } = req.body;

    const seatMap = { hatchback: 4, sedan: 4, suv: 6, mpv: 7 };
    const totalSeats = seatMap[vehicleType] || 4;

    const vehiclePhoto = req.file ? req.file.path : undefined;

    const existing = await Driver.findOne({ userId: req.user._id });

    let driver;
    if (existing) {
      driver = await Driver.findOneAndUpdate(
        { userId: req.user._id },
        {
          vehicleName,
          vehicleNumber,
          vehicleType,
          totalSeats,
          licenseNumber,
          ...(vehiclePhoto && { vehiclePhoto }),
        },
        { new: true, runValidators: true }
      );
    } else {
      driver = await Driver.create({
        userId: req.user._id,
        vehicleName,
        vehicleNumber,
        vehicleType,
        totalSeats,
        licenseNumber,
        vehiclePhoto: vehiclePhoto || '',
      });
    }

    res.status(existing ? 200 : 201).json({ success: true, data: { driver } });
  } catch (err) {
    next(err);
  }
};

// ─── Get Driver Profile ───────────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email phone avatar'
    );
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver profile not found.' });
    }
    res.json({ success: true, data: { driver } });
  } catch (err) {
    next(err);
  }
};

// ─── Get All Booking Requests for Driver's Rides ──────────────────────────────
exports.getBookingRequests = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver profile not found.' });
    }

    // Get all driver rides
    const rides = await Ride.find({ driverId: driver._id, status: 'scheduled' }).select('_id source destination date time');

    const rideIds = rides.map((r) => r._id);

    const bookings = await Booking.find({ rideId: { $in: rideIds } })
      .populate('passengerId', 'name avatar phone')
      .populate('rideId', 'source destination date time fare')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { bookings } });
  } catch (err) {
    next(err);
  }
};

// ─── Get Driver Dashboard Stats ───────────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(200).json({
        success: true,
        data: { hasProfile: false, stats: null },
      });
    }

    const totalRides = await Ride.countDocuments({ driverId: driver._id });
    const activeRides = await Ride.countDocuments({ driverId: driver._id, status: 'scheduled' });
    const completedRides = await Ride.countDocuments({ driverId: driver._id, status: 'completed' });
    const pendingBookings = await Booking.countDocuments({
      rideId: { $in: (await Ride.find({ driverId: driver._id }).select('_id')).map((r) => r._id) },
      bookingStatus: 'pending',
    });

    res.json({
      success: true,
      data: {
        hasProfile: true,
        driver,
        stats: { totalRides, activeRides, completedRides, pendingBookings },
      },
    });
  } catch (err) {
    next(err);
  }
};
