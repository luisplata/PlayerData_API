/**
 * AuthV2Middleware - Interface Adapter Layer
 * Enhanced authentication middleware for API v2
 */
const { expressjwt: expressJwt } = require('express-jwt');
const AuthServiceV2 = require('../../services/v2/AuthServiceV2');

class AuthV2Middleware {
  constructor() {
    this.authServiceV2 = new AuthServiceV2();
  }

  /**
   * Enhanced JWT authentication middleware for v2
   */
  getAuthenticateMiddleware() {
    return expressJwt({
      secret: process.env.JWT_SECRET || 'your_secret_key',
      algorithms: ['HS256'],
      issuer: 'playerdb-api-v2',
      audience: 'playerdb-client',
      requestProperty: 'user'
    });
  }

  /**
   * Middleware to handle token refresh
   */
  handleTokenRefresh = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided',
          statusCode: 401
        }
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = this.authServiceV2.verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.message.includes('expired')) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Access token expired. Please refresh your token.',
            statusCode: 401,
            code: 'TOKEN_EXPIRED'
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid access token',
            statusCode: 401,
            code: 'INVALID_TOKEN'
          }
        });
      }
    }
  };

  /**
   * Middleware to validate refresh token
   */
  validateRefreshToken = (req, res, next) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Refresh token is required',
          statusCode: 400
        }
      });
    }

    try {
      const decoded = this.authServiceV2.verifyRefreshToken(refreshToken);
      req.refreshTokenData = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 401
        }
      });
    }
  };

  /**
   * Middleware to check token expiration and provide refresh info
   */
  checkTokenExpiration = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const expiration = this.authServiceV2.getTokenExpiration(token);
        const now = new Date();
        const timeUntilExpiry = expiration.getTime() - now.getTime();
        
        // If token expires in less than 5 minutes, add warning header
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          res.setHeader('X-Token-Expires-Soon', 'true');
          res.setHeader('X-Token-Expires-In', Math.floor(timeUntilExpiry / 1000));
        }
      } catch (error) {
        // Ignore token parsing errors in this middleware
      }
    }
    
    next();
  };

  /**
   * Middleware to add authentication info to response
   */
  addAuthInfo = (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      if (data && typeof data === 'object' && data.success) {
        // Add authentication info to successful responses
        if (req.user) {
          data.auth = {
            playerId: req.user.playerId,
            sessionId: req.user.sessionId,
            tokenExpiresAt: req.user.exp ? new Date(req.user.exp * 1000).toISOString() : null
          };
        }
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

module.exports = AuthV2Middleware;
