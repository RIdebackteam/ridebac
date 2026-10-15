const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/email.service');

// ─── Register ────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Normalize phone — strip +91, spaces, dashes
    const cleanPhone = (phone || '').replace(/(\+91|\s|-)/g, '').trim()

    const user = await User.create({ name, email, phone: cleanPhone, password, role });

    // Generate mock OTP (in production: send via SMS/email)
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // Send OTP via email
    await sendOTPEmail({ name: user.name, email, otp, type: 'verify' });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your OTP.',
      data: {
        user,
        token,
        otpSent: true,
        // Return OTP in dev mode so frontend can display it
        ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (!user.otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);
    res.json({ success: true, message: 'Account verified successfully.', data: { user, token } });
  } catch (err) {
    next(err);
  }
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail({ name: user.name, email, otp, type: 'resend' });

    res.json({ success: true, message: 'OTP resent successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // If not verified, generate a fresh OTP and let them in with a warning
    if (!user.isVerified) {
      const otp = user.generateOTP();
      await user.save({ validateBeforeSave: false });
      await sendOTPEmail({ name: user.name, email, otp, type: 'login' });

      const token = generateToken(user._id, user.role);
      const safeUser = user.toJSON();
      return res.json({
        success: true,
        message: 'Login successful. Please verify your account.',
        data: {
          user: safeUser,
          token,
          needsVerification: true,
          ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
        },
      });
    }

    const token = generateToken(user._id, user.role);
    const safeUser = user.toJSON();

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: { user: safeUser, token },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ success: true, message: 'If that email exists, an OTP was sent.' });
    }
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail({ name: user.name, email, otp, type: 'reset' });

    res.json({ success: true, message: 'Password reset OTP sent.' });
  } catch (err) {
    next(err);
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user || !user.otp || user.otpExpires < Date.now() || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};
