/**
 * ErrorHandlerMiddleware - Interface Adapter Layer
 * Centralized error handling middleware
 */
const { customLogger } = require('../../utils/logger');

class ErrorHandlerMiddleware {
  static handle(error, req, res, next) {
    // Log the error
    customLogger.error({
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Default error response
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = null;

    // Handle specific error types
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Error';
      details = error.message;
    } else if (error.name === 'UnauthorizedError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token has expired';
    } else if (error.message.includes('not found')) {
      statusCode = 404;
      message = error.message;
    } else if (error.message.includes('already exists') || error.message.includes('already awarded')) {
      statusCode = 409;
      message = error.message;
    } else if (error.message.includes('Unauthorized')) {
      statusCode = 401;
      message = error.message;
    } else if (error.message.includes('required') || error.message.includes('must be')) {
      statusCode = 400;
      message = error.message;
    } else if (error.message) {
      message = error.message;
    }

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
      message = 'Internal Server Error';
      details = null;
    }

    const errorResponse = {
      success: false,
      error: {
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.url
      }
    };

    if (details) {
      errorResponse.error.details = details;
    }

    res.status(statusCode).json(errorResponse);
  }

  static notFound(req, res, next) {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
  }

  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = ErrorHandlerMiddleware;
