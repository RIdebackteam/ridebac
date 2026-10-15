const express = require('express');
const multer = require('multer');
const router = express.Router();
const driverController = require('../controllers/driver.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

// Multer for vehicle photo (disk storage; swap to Cloudinary in production)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/vehicles/'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `vehicle-${req.user._id}-${Date.now()}.${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

router.use(protect, restrictTo('driver'));

router.get('/dashboard', driverController.getDashboardStats);
router.get('/profile', driverController.getProfile);
router.post('/profile', upload.single('vehiclePhoto'), driverController.upsertProfile);
router.put('/profile', upload.single('vehiclePhoto'), driverController.upsertProfile);
router.get('/bookings', driverController.getBookingRequests);

module.exports = router;
