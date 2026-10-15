/**
 * Restrict route access to specific roles.
 * Usage: restrictTo('driver') or restrictTo('passenger')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is for ${roles.join('/')} only.`,
      });
    }
    next();
  };
};

module.exports = { restrictTo };
