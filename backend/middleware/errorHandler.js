const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';
  let errors     = null;

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // ── Sequelize Validation Error ───────────────────────────────────────────
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message    = 'Validation Error';
    errors     = err.errors ? err.errors.map(e => ({
      field:   e.path,
      message: e.message
    })) : null;
  }

  // ── Sequelize Connection Error ───────────────────────────────────────────
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    statusCode = 503;
    message    = 'Database connection error.';
  }

  // ── JWT Errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token has expired.';
  }

  // ── Cast / Syntax Errors ─────────────────────────────────────────────────
  if (err.name === 'SyntaxError' && err.status === 400) {
    statusCode = 400;
    message    = 'Invalid JSON in request body.';
  }

  const response = {
    success: false,
    message
  };

  if (errors) response.errors = errors;

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * notFound - 404 handler for unmatched routes.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
