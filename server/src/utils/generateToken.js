const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a user.
 * @param {string} userId - MongoDB ObjectId string
 * @param {string} role - 'driver' | 'passenger'
 * @returns {string} Signed JWT
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
