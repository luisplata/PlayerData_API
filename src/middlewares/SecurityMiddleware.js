const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

function parseAllowedOrigins(rawOrigins) {
  if (!rawOrigins || typeof rawOrigins !== 'string') {
    return [];
  }

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parsePositiveInt(value, defaultValue) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultValue;
}

function getCorsOptions(env = process.env) {
  const allowedOrigins = parseAllowedOrigins(env.CORS_ALLOWED_ORIGINS);

  return {
    origin(origin, callback) {
      // Native Unity requests may not send Origin.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    }
  };
}

function createRateLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        message,
        statusCode: 429
      }
    }
  });
}

function createSensitiveRateLimiters(env = process.env) {
  const windowMs = parsePositiveInt(env.RATE_LIMIT_WINDOW_MS, 60 * 1000);
  const loginMax = parsePositiveInt(env.RATE_LIMIT_MAX_LOGIN, 5);
  const validateMax = parsePositiveInt(env.RATE_LIMIT_MAX_VALIDATE, 10);

  return {
    loginLimiter: createRateLimiter({
      windowMs,
      max: loginMax,
      message: 'Too many login attempts, please try again later.'
    }),
    validateLimiter: createRateLimiter({
      windowMs,
      max: validateMax,
      message: 'Too many nickname validation requests, please try again later.'
    })
  };
}

function securityHeaders() {
  return helmet();
}

module.exports = {
  getCorsOptions,
  createSensitiveRateLimiters,
  securityHeaders
};