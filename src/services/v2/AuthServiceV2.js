/**
 * AuthServiceV2 - Service Layer
 * Enhanced authentication service for API v2 with refresh tokens
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class AuthServiceV2 {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'your_secret_key';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key';
    this.accessTokenExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    this.refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  generateAccessToken(payload) {
    try {
      if (!this.secret || this.secret === 'your_secret_key') {
        throw new Error('JWT_SECRET environment variable is not properly configured');
      }
      
      return jwt.sign(payload, this.secret, { 
        expiresIn: this.accessTokenExpiresIn,
        issuer: 'playerdb-api-v2',
        audience: 'playerdb-client'
      });
    } catch (error) {
      throw new Error(`Failed to generate access token: ${error.message}`);
    }
  }

  generateRefreshToken(payload) {
    try {
      if (!this.refreshSecret || this.refreshSecret === 'your_refresh_secret_key') {
        throw new Error('JWT_REFRESH_SECRET environment variable is not properly configured');
      }
      
      return jwt.sign(payload, this.refreshSecret, { 
        expiresIn: this.refreshTokenExpiresIn,
        issuer: 'playerdb-api-v2',
        audience: 'playerdb-client'
      });
    } catch (error) {
      throw new Error(`Failed to generate refresh token: ${error.message}`);
    }
  }

  generateTokenPair(payload) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.accessTokenExpiresIn,
      refreshExpiresIn: this.refreshTokenExpiresIn
    };
  }

  verifyAccessToken(token) {
    try {
      if (!this.secret || this.secret === 'your_secret_key') {
        throw new Error('JWT_SECRET environment variable is not properly configured');
      }
      
      return jwt.verify(token, this.secret, {
        issuer: 'playerdb-api-v2',
        audience: 'playerdb-client'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid access token');
      } else {
        throw new Error(`Access token verification failed: ${error.message}`);
      }
    }
  }

  verifyRefreshToken(token) {
    try {
      if (!this.refreshSecret || this.refreshSecret === 'your_refresh_secret_key') {
        throw new Error('JWT_REFRESH_SECRET environment variable is not properly configured');
      }
      
      return jwt.verify(token, this.refreshSecret, {
        issuer: 'playerdb-api-v2',
        audience: 'playerdb-client'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error(`Refresh token verification failed: ${error.message}`);
      }
    }
  }

  refreshAccessToken(refreshToken) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Generate new access token with same payload
      const newAccessToken = this.generateAccessToken({
        playerId: decoded.playerId,
        sessionId: decoded.sessionId
      });
      
      return {
        accessToken: newAccessToken,
        tokenType: 'Bearer',
        expiresIn: this.accessTokenExpiresIn
      };
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }

  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error(`Failed to decode token: ${error.message}`);
    }
  }

  getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      return new Date(decoded.exp * 1000);
    } catch (error) {
      throw new Error(`Failed to get token expiration: ${error.message}`);
    }
  }
}

module.exports = AuthServiceV2;
