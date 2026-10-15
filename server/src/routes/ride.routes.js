const express = require('express');
const router = express.Router();
const rideController = require('../controllers/ride.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

// Public routes (with optional auth for privacy logic)
router.get('/', rideController.searchRides);
router.get('/:id', optionalAuth, rideController.getRideById);
router.get('/:id/seats', protect, rideController.getRideSeats);

// Driver only
router.use(protect);
router.get('/driver/my-rides', restrictTo('driver'), rideController.getMyRides);
router.post('/', restrictTo('driver'), rideController.createRide);
router.put('/:id', restrictTo('driver'), rideController.updateRide);
router.delete('/:id', restrictTo('driver'), rideController.deleteRide);
router.patch('/:id/complete', restrictTo('driver'), rideController.completeRide);

module.exports = router;
