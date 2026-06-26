const jwt = require('jsonwebtoken');

/**
 * authenticate - verifies JWT from Authorization header or cookie.
 * Attaches decoded payload to req.user.
 */
const authenticate = (req, res, next) => {
  try {
    let token = null;

    // 1. Try Authorization header  (Bearer <token>)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Fallback to cookie
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sprinthub_super_secret_jwt_key_2024');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

/**
 * authorize - factory that returns middleware restricting access to given roles.
 * Usage: authorize('admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.'
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Requires role: ${roles.join(' or ')}.`
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
