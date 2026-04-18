require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const express = require('express');
const cors = require('cors');
const { expressjwt: expressJwt } = require('express-jwt');

const { generalLogger, customLogger } = require('./utils/logger.js');
const ErrorHandlerMiddleware = require('./src/middlewares/ErrorHandlerMiddleware');
const ValidationMiddleware = require('./src/middlewares/ValidationMiddleware');
const ApiVersionMiddleware = require('./src/middlewares/ApiVersionMiddleware');
const AuthV2Middleware = require('./src/middlewares/v2/AuthV2Middleware');
const DependencyContainer = require('./src/config/DependencyContainer');
const { swaggerUi, specs } = require('./src/config/swagger');

const app = express();
const port = process.env.PORT || 8080;

// Initialize dependency container
const container = new DependencyContainer();
const authV2Middleware = new AuthV2Middleware();

// Middleware setup
app.use(cors());
app.use(express.json());

// API Versioning middleware
app.use(ApiVersionMiddleware.handleVersion);
app.use(ApiVersionMiddleware.addVersionInfo);
app.use(ApiVersionMiddleware.deprecationWarning);

// JWT Authentication middleware
const authenticate = expressJwt({ 
  secret: process.env.JWT_SECRET || 'your_secret_key', 
  algorithms: ['HS256'] 
});

// API Version 1 Routes
const v1Router = express.Router();

// Player routes v1
v1Router.post('/player/login', 
  ValidationMiddleware.validatePlayerLogin,
  container.getController('playerController').login
);

v1Router.post('/player', 
  ValidationMiddleware.validatePlayerData,
  container.getController('playerController').createPlayer
);

v1Router.get('/player/validate/:nickname',
  ValidationMiddleware.validateNickname,
  container.getController('playerController').validateNickname
);

v1Router.get('/player/:nickname',
  authenticate,
  ValidationMiddleware.validateNickname,
  container.getController('playerController').getPlayerIdByNickname
);

v1Router.get('/player/id/:playerId',
  authenticate,
  ValidationMiddleware.validatePlayerId,
  container.getController('playerController').getPlayerById
);

v1Router.put('/player/nickname/:playerId',
  authenticate,
  ValidationMiddleware.validatePlayerId,
  ValidationMiddleware.validateBodyNickname,
  container.getController('playerController').updatePlayerNickname
);

// Battle Pass routes v1
v1Router.get('/battle-pass/:playerId',
  authenticate,
  ValidationMiddleware.validatePlayerId,
  container.getController('battlePassController').getBattlePassByPlayerId
);

v1Router.post('/battle-pass/experience',
  authenticate,
  ValidationMiddleware.validateExperience,
  container.getController('battlePassController').addExperience
);

// Heroes routes v1
v1Router.post('/heroes',
  authenticate,
  ValidationMiddleware.validateHeroData,
  container.getController('heroController').createHero
);

v1Router.get('/heroes',
  authenticate,
  container.getController('heroController').getHeroList
);

v1Router.post('/heroes/dialog/start',
  authenticate,
  ValidationMiddleware.validateDialogStart,
  container.getController('dialogController').startDialog
);

v1Router.post('/heroes/dialog/answer',
  authenticate,
  ValidationMiddleware.validateDialogAnswer,
  container.getController('dialogController').sendAnswer
);

v1Router.get('/heroes/passive/:playerId',
  authenticate,
  ValidationMiddleware.validatePlayerId,
  container.getController('passiveController').getPassive
);

// Mount versioned routes
app.use('/api/v1', v1Router);

// API Version 2 Routes
const v2Router = express.Router();

// Player routes v2
v2Router.post('/player/login', 
  ValidationMiddleware.validatePlayerData,
  container.getController('playerV2Controller').login
);

v2Router.post('/player', 
  ValidationMiddleware.validatePlayerData,
  container.getController('playerV2Controller').createPlayer
);

v2Router.post('/player/refresh',
  authV2Middleware.validateRefreshToken,
  container.getController('playerV2Controller').refreshToken
);

v2Router.get('/player/profile',
  authV2Middleware.handleTokenRefresh,
  authV2Middleware.checkTokenExpiration,
  authV2Middleware.addAuthInfo,
  container.getController('playerV2Controller').getProfile
);

// Mount v2 routes
app.use('/api/v2', v2Router);

// Swagger Documentation
/**
 * @swagger
 * /api-docs:
 *   get:
 *     summary: Swagger UI documentation endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Swagger UI HTML page
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'PlayerData API Documentation'
}));

// Health check endpoints
app.get('/health', container.getController('healthController').basic);
app.get('/health/detailed', container.getController('healthController').detailed);
app.get('/health/live', container.getController('healthController').liveness);
app.get('/health/ready', container.getController('healthController').readiness);

// API Version info endpoint
/**
 * @swagger
 * /api/versions:
 *   get:
 *     summary: Get supported API versions and lifecycle metadata
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Version metadata returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         supportedVersions:
 *                           type: object
 *                           additionalProperties: true
 *                         versionInfo:
 *                           type: object
 *                           additionalProperties: true
 *                         currentVersion:
 *                           type: string
 *                         recommendation:
 *                           type: string
 */
app.get('/api/versions', (req, res) => {
  res.json({
    success: true,
    data: {
      supportedVersions: ApiVersionMiddleware.getSupportedVersions(),
      versionInfo: ApiVersionMiddleware.getVersionInfo(),
      currentVersion: 'v2',
      recommendation: 'Use /api/v2/ for new integrations, /api/v1/ for stable features'
    }
  });
});

// Legacy routes (backward compatibility)
/**
 * @swagger
 * /api/player/login:
 *   post:
 *     summary: Legacy player login
 *     deprecated: true
 *     tags: [Legacy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *             properties:
 *               playerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/player/login', 
  ValidationMiddleware.validatePlayerLogin,
  container.getController('playerController').login
);

/**
 * @swagger
 * /api/player:
 *   post:
 *     summary: Legacy create/update player
 *     deprecated: true
 *     tags: [Legacy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - nickname
 *               - key
 *             properties:
 *               playerId:
 *                 type: string
 *               nickname:
 *                 type: string
 *               key:
 *                 type: string
 *     responses:
 *       201:
 *         description: Player created
 *       200:
 *         description: Player updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized API key
 */
app.post('/api/player', 
  ValidationMiddleware.validatePlayerData,
  container.getController('playerController').createPlayer
);

/**
 * @swagger
 * /api/player/validate/{nickname}:
 *   get:
 *     summary: Legacy nickname validation
 *     deprecated: true
 *     tags: [Legacy]
 *     parameters:
 *       - in: path
 *         name: nickname
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nickname availability result
 *       500:
 *         description: Server error
 */
app.get('/api/player/validate/:nickname',
  ValidationMiddleware.validateNickname,
  container.getController('playerController').validateNickname
);

/**
 * @swagger
 * /api/player/{nickname}:
 *   get:
 *     summary: Legacy get playerId by nickname
 *     deprecated: true
 *     tags: [Legacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nickname
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Player found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Player not found
 */
app.get('/api/player/:nickname',
  authenticate,
  ValidationMiddleware.validateNickname,
  container.getController('playerController').getPlayerIdByNickname
);

/**
 * @swagger
 * /api/player/id/{playerId}:
 *   get:
 *     summary: Legacy get player by ID
 *     deprecated: true
 *     tags: [Legacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Player details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Player not found
 */
app.get('/api/player/id/:playerId',
  authenticate,
  ValidationMiddleware.validatePlayerId,
  container.getController('playerController').getPlayerById
);

/**
 * @swagger
 * /api/player/nickname/{playerId}:
 *   put:
 *     summary: Legacy update player nickname
 *     deprecated: true
 *     tags: [Legacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nickname
 *             properties:
 *               nickname:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nickname updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Player not found
 */
app.put('/api/player/nickname/:playerId',
  authenticate,
  ValidationMiddleware.validatePlayerId,
  ValidationMiddleware.validateNickname,
  container.getController('playerController').updatePlayerNickname
);

/**
 * @swagger
 * /api/battle-pass/{playerId}:
 *   get:
 *     summary: Legacy get battle pass by playerId
 *     deprecated: true
 *     tags: [Legacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Battle pass payload
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Battle pass not found
 */
app.get('/api/battle-pass/:playerId',
  authenticate,
  ValidationMiddleware.validatePlayerId,
  container.getController('battlePassController').getBattlePassByPlayerId
);

/**
 * @swagger
 * /api/battle-pass/experience:
 *   post:
 *     summary: Legacy add battle pass experience
 *     deprecated: true
 *     tags: [Legacy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - experience
 *             properties:
 *               playerId:
 *                 type: string
 *               experience:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Experience updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
app.post('/api/battle-pass/experience',
  authenticate,
  ValidationMiddleware.validateExperience,
  container.getController('battlePassController').addExperience
);

const BattlePassReward = require('./Router/BattlePassRewardRoutes.js');
const PlayerReward = require('./Router/PlayerRewardRoutes.js');

app.use('/api/v1/battle-pass-reward', BattlePassReward);
app.use('/api/v1/player-reward', PlayerReward);

// Note: Legacy routes removed - all functionality now available through Clean Architecture endpoints

// Error handling middleware (must be last)
app.use(ErrorHandlerMiddleware.notFound);
app.use(ErrorHandlerMiddleware.handle);

// Iniciar el servidor
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
