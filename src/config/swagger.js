/**
 * Swagger Configuration
 * API Documentation setup
 */
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PlayerData API',
      version: '1.0.0',
      description: 'A RESTful API for managing players and battle pass system using Clean Architecture',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `${process.env.API_BASE_URL || 'http://localhost:8080'}/api/v1`,
        description: 'API Version 1 - Current stable version'
      },
      {
        url: `${process.env.API_BASE_URL || 'http://localhost:8080'}/api`,
        description: 'Legacy API - Deprecated, use v1 instead'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Player: {
          type: 'object',
          required: ['playerId', 'nickname'],
          properties: {
            id: {
              type: 'integer',
              description: 'Auto-generated player ID'
            },
            playerId: {
              type: 'string',
              description: 'Unique player identifier',
              minLength: 3,
              maxLength: 50,
              pattern: '^[a-zA-Z0-9_-]+$'
            },
            nickname: {
              type: 'string',
              description: 'Player display name',
              minLength: 2,
              maxLength: 30,
              pattern: '^[a-zA-Z0-9_-]+$'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        BattlePass: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            playerId: {
              type: 'string'
            },
            level: {
              type: 'integer',
              minimum: 1,
              maximum: 100
            },
            experience: {
              type: 'integer',
              minimum: 0,
              maximum: 10000
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Reward: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['gold', 'powerup', 'profilePicture', 'profileBackground', 'profileAvatar']
            },
            body: {
              type: 'object',
              description: 'Reward content based on type'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string'
                },
                statusCode: {
                  type: 'integer'
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time'
                },
                path: {
                  type: 'string'
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/controllers/*.js', './index.js'] // Paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
