require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const express = require('express');
const cors = require('cors');
const { expressjwt: expressJwt } = require('express-jwt');

const ErrorHandlerMiddleware = require('./src/middlewares/ErrorHandlerMiddleware');
const ValidationMiddleware = require('./src/middlewares/ValidationMiddleware');
const ApiVersionMiddleware = require('./src/middlewares/ApiVersionMiddleware');
const DependencyContainer = require('./src/config/DependencyContainer');
const { swaggerUi, specs } = require('./src/config/swagger');
const { validateSecurityConfig } = require('./src/config/SecurityConfig');

validateSecurityConfig(process.env);

const app = express();
const port = process.env.PORT || 8080;

// Initialize dependency container
const container = new DependencyContainer();

// Middleware setup
app.use(cors());
app.use(express.json());

// API Versioning middleware
app.use(ApiVersionMiddleware.handleVersion);
app.use(ApiVersionMiddleware.addVersionInfo);
app.use(ApiVersionMiddleware.deprecationWarning);

// JWT Authentication middleware
const authenticate = expressJwt({ 
  secret: process.env.JWT_SECRET,
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
  authenticate,
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
      currentVersion: 'v1',
      recommendation: 'Use /api/v1/ for all active integrations'
    }
  });
});

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
