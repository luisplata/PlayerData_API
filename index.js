require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const express = require('express');
const cors = require('cors');
const { expressjwt: expressJwt } = require('express-jwt');

const { generalLogger, customLogger } = require('./utils/logger.js');
const ErrorHandlerMiddleware = require('./src/middlewares/ErrorHandlerMiddleware');
const ValidationMiddleware = require('./src/middlewares/ValidationMiddleware');
const DependencyContainer = require('./src/config/DependencyContainer');
const { swaggerUi, specs } = require('./src/config/swagger');

const app = express();
const port = process.env.PORT || 8080;

// Initialize dependency container
const container = new DependencyContainer();

// Middleware setup
app.use(cors());
app.use(express.json());

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

// Player routes
app.post('/api/player/login', 
  ValidationMiddleware.validatePlayerLogin,
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

// Battle Pass routes
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
