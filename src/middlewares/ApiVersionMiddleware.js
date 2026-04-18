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
    // Only treat '/api/vN/...' as versioned routes.
    const versionMatch = req.path.match(/^\/api\/(v\d+)(?:\/|$)/);
    const version = versionMatch ? versionMatch[1] : undefined;
    
    switch (version) {
      case 'v1':
        req.apiVersion = 'v1';
        req.apiVersionNumber = 1;
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
            supportedVersions: ['v1']
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
      current: 'v1',
      supported: ['v1'],
      deprecated: ['legacy', 'v2'],
      legacy: false
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
      v1: {
        version: '1.0.0',
        status: 'current',
        releaseDate: '2024-12-01',
        description: 'Current active version with Clean Architecture',
        features: [
          'Clean Architecture implementation',
          'Comprehensive validation',
          'Transaction support',
          'Advanced error handling',
          'Swagger documentation',
          'Health checks'
        ]
      },
      v2: {
        version: '2.0.0',
        status: 'inactive',
        description: 'Available in codebase but currently not exposed in runtime routes'
      },
      legacy: {
        version: '0.9.0',
        status: 'inactive',
        releaseDate: '2024-11-01',
        deprecationDate: '2025-12-31',
        description: 'Legacy routes are disabled in runtime but kept in code for future reference'
      }
    };
  }
}

module.exports = ApiVersionMiddleware;
