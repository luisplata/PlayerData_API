/**
 * JwtService - Interface Adapter Layer
 * Handles JWT token operations
 */
const jwt = require('jsonwebtoken');

class JwtService {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'your_secret_key';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  }

  generateToken(payload) {
    try {
      if (!this.secret || this.secret === 'your_secret_key') {
        throw new Error('JWT_SECRET environment variable is not properly configured');
      }
      
      return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    } catch (error) {
      throw new Error(`Failed to generate token: ${error.message}`);
    }
  }

  verifyToken(token) {
    try {
      if (!this.secret || this.secret === 'your_secret_key') {
        throw new Error('JWT_SECRET environment variable is not properly configured');
      }
      
      return jwt.verify(token, this.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error(`Token verification failed: ${error.message}`);
      }
    }
  }

  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error(`Failed to decode token: ${error.message}`);
    }
  }
}

module.exports = JwtService;
