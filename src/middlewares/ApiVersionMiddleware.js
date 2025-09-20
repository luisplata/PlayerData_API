/**
 * ApiVersionMiddleware - Interface Adapter Layer
 * Handles API versioning and deprecation warnings
 */
class ApiVersionMiddleware {
  /**
   * Middleware to add version information to responses
   */
  static addVersionInfo(req, res, next) {
    // Add version info to response headers
    res.setHeader('API-Version', 'v1');
    res.setHeader('API-Deprecation-Date', '2025-12-31');
    
    // Add version info to response body for legacy routes
    if (req.path.startsWith('/api/') && !req.path.startsWith('/api/v1/')) {
      const originalJson = res.json;
      res.json = function(data) {
        if (data && typeof data === 'object') {
          data.apiVersion = 'legacy';
          data.deprecationWarning = 'This endpoint is deprecated. Please use /api/v1/ instead.';
          data.deprecationDate = '2025-12-31';
        }
        return originalJson.call(this, data);
      };
    }
    
    next();
  }

  /**
   * Middleware to handle version-specific logic
   */
  static handleVersion(req, res, next) {
    const version = req.path.split('/')[2]; // Extract version from path
    
    switch (version) {
      case 'v1':
        req.apiVersion = 'v1';
        req.apiVersionNumber = 1;
        break;
      case 'v2':
        req.apiVersion = 'v2';
        req.apiVersionNumber = 2;
        break;
      case undefined:
        // Legacy routes without version
        req.apiVersion = 'legacy';
        req.apiVersionNumber = 0;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: {
            message: `Unsupported API version: ${version}`,
            statusCode: 400,
            supportedVersions: ['v1', 'v2']
          }
        });
    }
    
    next();
  }

  /**
   * Middleware to add deprecation warnings for legacy routes
   */
  static deprecationWarning(req, res, next) {
    if (req.apiVersion === 'legacy') {
      res.setHeader('Warning', '299 - "This API version is deprecated. Please use /api/v1/ instead."');
    }
    
    next();
  }

  /**
   * Get supported API versions
   */
  static getSupportedVersions() {
    return {
      current: 'v2',
      supported: ['v1', 'v2'],
      deprecated: [],
      legacy: true
    };
  }

  /**
   * Check if a version is supported
   */
  static isVersionSupported(version) {
    const supportedVersions = this.getSupportedVersions().supported;
    return supportedVersions.includes(version);
  }

  /**
   * Get version info for API documentation
   */
  static getVersionInfo() {
    return {
      v2: {
        version: '2.0.0',
        status: 'current',
        releaseDate: '2024-12-15',
        description: 'Latest version with enhanced features',
        features: [
          'Enhanced player profiles with email and avatar',
          'Refresh token authentication',
          'Player statistics and achievements',
          'Advanced preferences system',
          'Session management',
          'Token expiration warnings',
          'All v1 features'
        ]
      },
      v1: {
        version: '1.0.0',
        status: 'stable',
        releaseDate: '2024-12-01',
        description: 'Stable version with Clean Architecture',
        features: [
          'Clean Architecture implementation',
          'Comprehensive validation',
          'Transaction support',
          'Advanced error handling',
          'Swagger documentation',
          'Health checks'
        ]
      },
      legacy: {
        version: '0.9.0',
        status: 'deprecated',
        releaseDate: '2024-11-01',
        deprecationDate: '2025-12-31',
        description: 'Legacy version for backward compatibility',
        warning: 'This version will be removed on 2025-12-31'
      }
    };
  }
}

module.exports = ApiVersionMiddleware;
