const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

router.use(protect);

// Passenger routes
router.post('/', restrictTo('passenger'), bookingController.createBooking);
router.get('/my', bookingController.getMyBookings);
router.patch('/:id/pay', restrictTo('passenger'), bookingController.payAndConfirm);
router.patch('/:id/cancel', restrictTo('passenger'), bookingController.cancelBooking);
router.patch('/:id/rate', restrictTo('passenger'), bookingController.rateDriver);

// Driver routes
router.patch('/:id/accept', restrictTo('driver'), bookingController.acceptBooking);
router.patch('/:id/reject', restrictTo('driver'), bookingController.rejectBooking);

module.exports = router;
