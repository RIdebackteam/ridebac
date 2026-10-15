const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| RAZORPAY INITIALIZATION
|--------------------------------------------------------------------------
*/

const getRazorpay = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        return null;
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
};

/*
|--------------------------------------------------------------------------
| CREATE RAZORPAY ORDER
|--------------------------------------------------------------------------
*/

router.post(
    '/create-order',
    protect,
    restrictTo('passenger'),
    async (req, res) => {
        try {
            const razorpay = getRazorpay();

            if (!razorpay) {
                return res.status(503).json({
                    success: false,
                    message: 'Payment is temporarily unavailable. Please try again later.',
                });
            }

            const { bookingId } = req.body;

            if (!bookingId) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required',
                });
            }

            const booking = await Booking.findOne({
                _id: bookingId,
                passengerId: req.user._id,
                bookingStatus: 'pending',
                paymentStatus: 'pending',
            });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Pending booking not found',
                });
            }

            const amount = Number(booking.fare);

            if (!Number.isFinite(amount) || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid booking fare',
                });
            }

            const options = {
                amount: Math.round(amount * 100),
                currency: 'INR',
                receipt: `RB_${booking._id}`,
                notes: {
                    bookingId: booking._id.toString(),
                    rideId: booking.rideId.toString(),
                    passengerId: booking.passengerId.toString(),
                },
            };

            const order = await razorpay.orders.create(options);

            booking.razorpayOrderId = order.id;
            await booking.save();

            return res.status(200).json({
                success: true,
                data: {
                    orderId: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    bookingId: booking._id,
                    keyId: process.env.RAZORPAY_KEY_ID,
                },
            });
        } catch (error) {
            console.error('Razorpay create order error:', error.message);

            return res.status(500).json({
                success: false,
                message: 'Unable to create payment order',
            });
        }
    }
);

/*
|--------------------------------------------------------------------------
| VERIFY RAZORPAY PAYMENT
|--------------------------------------------------------------------------
*/

router.post(
    '/verify',
    protect,
    restrictTo('passenger'),
    async (req, res) => {
        try {
            const keySecret = process.env.RAZORPAY_KEY_SECRET;

            if (!process.env.RAZORPAY_KEY_ID || !keySecret) {
                return res.status(503).json({
                    success: false,
                    message: 'Payment verification is temporarily unavailable.',
                });
            }

            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            } = req.body;

            if (
                !razorpay_order_id ||
                !razorpay_payment_id ||
                !razorpay_signature
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing Razorpay payment details',
                });
            }

            const booking = await Booking.findOne({
                razorpayOrderId: razorpay_order_id,
                passengerId: req.user._id,
                bookingStatus: 'pending',
                paymentStatus: 'pending',
            });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Pending booking/payment not found',
                });
            }

            const generatedSignature = crypto
                .createHmac('sha256', keySecret)
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest('hex');

            // Compare signatures safely.
            const received = Buffer.from(razorpay_signature, 'hex');
            const expected = Buffer.from(generatedSignature, 'hex');

            if (
                received.length !== expected.length ||
                !crypto.timingSafeEqual(received, expected)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment verification failed',
                });
            }

            /*
             * Payment signature is valid.
             * Confirm the booking.
             */

            booking.paymentStatus = 'paid';
            booking.paymentRef = razorpay_payment_id;
            booking.razorpayPaymentId = razorpay_payment_id;
            booking.razorpaySignature = razorpay_signature;
            booking.bookingStatus = 'confirmed';

            await booking.save();

            /*
             * Record the booked seat.
             */

            await Ride.findByIdAndUpdate(
                booking.rideId,
                {
                    $push: {
                        bookedSeats: {
                            seatIndex: booking.seatIndex,
                            bookingId: booking._id,
                        },
                    },
                }
            );

            return res.status(200).json({
                success: true,
                message: 'Payment verified and booking confirmed',
                data: {
                    bookingId: booking._id,
                    paymentId: razorpay_payment_id,
                    bookingStatus: booking.bookingStatus,
                    paymentStatus: booking.paymentStatus,
                },
            });
        } catch (error) {
            console.error(
                'Razorpay verification error:',
                error.message
            );

            return res.status(500).json({
                success: false,
                message: 'Payment verification failed',
            });
        }
    }
);

module.exports = router;