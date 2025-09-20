/**
 * HealthController - Interface Adapter Layer
 * Handles health check HTTP requests
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check and monitoring endpoints
 */
const HealthCheckService = require('../services/HealthCheckService');
const ErrorHandlerMiddleware = require('../middlewares/ErrorHandlerMiddleware');

class HealthController {
  constructor() {
    this.healthCheckService = new HealthCheckService();
  }

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Basic health check
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: API is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "API is healthy"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 version:
   *                   type: string
   *                   example: "1.0.0"
   */
  basic = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  /**
   * @swagger
   * /health/detailed:
   *   get:
   *     summary: Detailed health check
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Detailed health status
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [healthy, warning, unhealthy]
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 version:
   *                   type: string
   *                 environment:
   *                   type: string
   *                 checks:
   *                   type: object
   *                   properties:
   *                     database:
   *                       type: object
   *                     memory:
   *                       type: object
   *                     uptime:
   *                       type: object
   *       503:
   *         description: Service unhealthy
   */
  detailed = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const healthStatus = await this.healthCheckService.performHealthCheck();
    
    const statusCode = healthStatus.status === 'unhealthy' ? 503 : 200;
    res.status(statusCode).json(healthStatus);
  });

  /**
   * @swagger
   * /health/live:
   *   get:
   *     summary: Liveness probe
   *     tags: [Health]
   *     description: Kubernetes liveness probe endpoint
   *     responses:
   *       200:
   *         description: Application is alive
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "alive"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 uptime:
   *                   type: number
   */
  liveness = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const livenessStatus = await this.healthCheckService.performLivenessCheck();
    res.json(livenessStatus);
  });

  /**
   * @swagger
   * /health/ready:
   *   get:
   *     summary: Readiness probe
   *     tags: [Health]
   *     description: Kubernetes readiness probe endpoint
   *     responses:
   *       200:
   *         description: Application is ready
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [ready, not_ready]
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 checks:
   *                   type: object
   *       503:
   *         description: Application not ready
   */
  readiness = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const readinessStatus = await this.healthCheckService.performReadinessCheck();
    
    const statusCode = readinessStatus.status === 'ready' ? 200 : 503;
    res.status(statusCode).json(readinessStatus);
  });
}

module.exports = HealthController;
