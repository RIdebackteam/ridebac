const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/:rideId', messageController.getChatHistory);
router.post('/', messageController.sendMessage);

module.exports = router;
