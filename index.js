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

// Swagger Documentation
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

// API Version 1 Routes
const v1Router = express.Router();

// Player routes v1
v1Router.post('/player/login', 
  ValidationMiddleware.validatePlayerData,
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
  ValidationMiddleware.validateNickname,
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

// Legacy routes (backward compatibility)
app.post('/api/player/login', 
  ValidationMiddleware.validatePlayerData,
  container.getController('playerController').login
);

app.post('/api/player', 
  ValidationMiddleware.validatePlayerData,
  container.getController('playerController').createPlayer
);

app.get('/api/player/validate/:nickname',
  ValidationMiddleware.validateNickname,
  container.getController('playerController').validateNickname
);

app.get('/api/player/:nickname',
  authenticate,
  ValidationMiddleware.validateNickname,
  container.getController('playerController').getPlayerIdByNickname
);

app.get('/api/player/id/:playerId',
  authenticate,
  ValidationMiddleware.validatePlayerId,
  container.getController('playerController').getPlayerById
);

app.put('/api/player/nickname/:playerId',
  authenticate,
  ValidationMiddleware.validatePlayerId,
  ValidationMiddleware.validateNickname,
  container.getController('playerController').updatePlayerNickname
);

app.get('/api/battle-pass/:playerId',
  authenticate,
  ValidationMiddleware.validatePlayerId,
  container.getController('battlePassController').getBattlePassByPlayerId
);

app.post('/api/battle-pass/experience',
  authenticate,
  ValidationMiddleware.validateExperience,
  container.getController('battlePassController').addExperience
);

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
