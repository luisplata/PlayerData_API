/**
 * HealthCheckService - Service Layer
 * Handles health check operations
 */
const db = require('../../DB/db.js');
const { customLogger } = require('../../utils/logger');

class HealthCheckService {
  constructor() {
    this.startTime = new Date();
    this.checks = {
      database: this.checkDatabase.bind(this),
      memory: this.checkMemory.bind(this),
      uptime: this.checkUptime.bind(this)
    };
  }

  async checkDatabase() {
    try {
      const start = Date.now();
      await db.raw('SELECT 1');
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        message: 'Database connection successful'
      };
    } catch (error) {
      customLogger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        message: 'Database connection failed'
      };
    }
  }

  checkMemory() {
    const memUsage = process.memoryUsage();
    const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const freeMB = totalMB - usedMB;
    const usagePercent = Math.round((usedMB / totalMB) * 100);

    return {
      status: usagePercent > 90 ? 'warning' : 'healthy',
      memory: {
        total: `${totalMB}MB`,
        used: `${usedMB}MB`,
        free: `${freeMB}MB`,
        usagePercent: `${usagePercent}%`
      },
      message: usagePercent > 90 ? 'High memory usage detected' : 'Memory usage normal'
    };
  }

  checkUptime() {
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    const uptimeSeconds = Math.floor(uptime % 60);

    return {
      status: 'healthy',
      uptime: {
        total: `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`,
        seconds: Math.floor(uptime),
        startTime: this.startTime.toISOString()
      },
      message: 'Application running normally'
    };
  }

  async performHealthCheck() {
    const results = {};
    let overallStatus = 'healthy';

    // Run all health checks
    for (const [name, check] of Object.entries(this.checks)) {
      try {
        results[name] = await check();
        
        // Update overall status based on individual checks
        if (results[name].status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (results[name].status === 'warning' && overallStatus === 'healthy') {
          overallStatus = 'warning';
        }
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          error: error.message,
          message: `Health check failed: ${name}`
        };
        overallStatus = 'unhealthy';
      }
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: results
    };
  }

  async performLivenessCheck() {
    // Simple liveness check - just verify the app is running
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  async performReadinessCheck() {
    // Readiness check - verify app is ready to serve requests
    const dbCheck = await this.checkDatabase();
    
    return {
      status: dbCheck.status === 'healthy' ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbCheck
      }
    };
  }
}

module.exports = HealthCheckService;
