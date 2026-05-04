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
      description:
        'A RESTful API for managing players and battle pass system using Clean Architecture',
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
        url: `${process.env.API_BASE_URL || 'http://localhost:8080'}`,
        description: 'API Version 1 - Current active version'
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
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
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
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
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
              enum: [
                'gold',
                'powerup',
                'profilePicture',
                'profileBackground',
                'profileAvatar'
              ]
            },
            body: {
              type: 'object',
              description: 'Reward content based on type'
            }
          }
        },
        Hero: {
          type: 'object',
          required: ['heroId', 'name'],
          properties: {
            id: {
              type: 'integer',
              description: 'Auto-generated hero row ID'
            },
            heroId: {
              type: 'string',
              description: 'Unique hero identifier',
              minLength: 3,
              maxLength: 50,
              pattern: '^[a-zA-Z0-9_-]+$'
            },
            name: {
              type: 'string',
              description: 'Hero display name',
              minLength: 2,
              maxLength: 80
            },
            metadata: {
              type: 'object',
              description:
                'Flexible hero metadata payload including progression tuning fields',
              properties: {
                role: {
                  type: 'string',
                  example: 'support'
                },
                xpPerLevel: {
                  type: 'integer',
                  minimum: 1,
                  example: 100,
                  description: 'Experience points required to level up the hero'
                },
                pointsLostPerGame: {
                  type: 'integer',
                  minimum: 0,
                  example: 2,
                  description:
                    'Points lost after a game outcome that applies a penalty'
                },
                minPointsGainedPerConversation: {
                  type: 'integer',
                  minimum: 0,
                  example: 1,
                  description:
                    'Minimum points granted when conversation is attempted but not fully completed'
                },
                pointsGainedPerConversationComplete: {
                  type: 'integer',
                  minimum: 0,
                  example: 10,
                  description:
                    'Points granted when conversation is fully completed successfully'
                }
              },
              additionalProperties: true,
              example: {
                role: 'support',
                xpPerLevel: 100,
                pointsLostPerGame: 2,
                minPointsGainedPerConversation: 1,
                pointsGainedPerConversationComplete: 10
              }
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        PlayerHeroInventoryItem: {
          allOf: [
            {
              $ref: '#/components/schemas/Hero'
            },
            {
              type: 'object',
              required: ['level', 'currentXp'],
              properties: {
                level: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Player progress level for this hero'
                },
                currentXp: {
                  type: 'integer',
                  minimum: 0,
                  description:
                    'Current XP accumulated within the active hero level'
                },
                xpToNextLevel: {
                  type: 'integer',
                  minimum: 0,
                  description:
                    'Remaining XP needed to reach the next hero level'
                },
                progressPct: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 100,
                  description:
                    'Derived progress percentage for slider-style UI rendering'
                }
              }
            }
          ]
        },
        PlayerHeroInventoryResponseData: {
          type: 'object',
          required: ['heroes'],
          properties: {
            heroes: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/PlayerHeroInventoryItem'
              }
            }
          }
        },
        Passive: {
          type: 'object',
          required: ['passiveId', 'heroId', 'name'],
          properties: {
            id: {
              type: 'integer'
            },
            passiveId: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              pattern: '^[a-zA-Z0-9_-]+$'
            },
            heroId: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              pattern: '^[a-zA-Z0-9_-]+$'
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 80
            },
            metadata: {
              type: 'object',
              additionalProperties: true
            },
            assigned_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        DialogQuestionPublic: {
          type: 'object',
          required: ['questionId', 'question'],
          properties: {
            id: {
              type: 'integer'
            },
            questionId: {
              type: 'string'
            },
            dialogId: {
              type: 'integer'
            },
            node_sequence: {
              type: 'string',
              description: 'Sequence identifier of the dialog node this question belongs to'
            },
            question: {
              type: 'string',
              maxLength: 280,
              description:
                'Visible dialog question text. Limited to 280 characters for the UI.'
            },
            order_index: {
              type: 'integer'
            }
          },
          description:
            'Public dialog question payload. Does not expose correct answer keys. The visible text is capped at 280 characters.',
          additionalProperties: false
        },
        DialogStartRequest: {
          type: 'object',
          required: ['playerId', 'heroId'],
          properties: {
            playerId: {
              type: 'string',
              pattern: '^[a-zA-Z0-9_-]+$'
            },
            heroId: {
              type: 'string',
              pattern: '^[a-zA-Z0-9_-]+$'
            }
          }
        },
        DialogStartResponseData: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            heroId: {
              type: 'string'
            },
            title: {
              type: 'string'
            },
            metadata: {
              type: 'object',
              additionalProperties: true
            },
            questions: {
              type: 'array',
              items: {
                allOf: [
                  { $ref: '#/components/schemas/DialogQuestionPublic' },
                  {
                    type: 'object',
                    properties: {
                      node: {
                        type: ['object', 'null'],
                        nullable: true,
                        properties: {
                          sequence: { type: 'string' },
                          emotion: { type: 'string' },
                          text: { type: 'string' },
                          possibleAnswers: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                optionKey: { type: 'string' },
                                optionText: { type: 'string' },
                                nextSequence: { type: ['string', 'null'], 'nullable': true }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        DialogAnswerRequest: {
          type: 'object',
          required: ['playerId', 'heroId', 'questionId', 'answer'],
          properties: {
            playerId: {
              type: 'string',
              pattern: '^[a-zA-Z0-9_-]+$'
            },
            heroId: {
              type: 'string',
              pattern: '^[a-zA-Z0-9_-]+$'
            },
            questionId: {
              type: 'string',
              pattern: '^[a-zA-Z0-9_-]+$'
            },
            answer: {
              type: 'string'
            }
          }
        },
        DialogAnswerResponseData: {
          type: 'object',
          properties: {
            correct: {
              type: 'boolean'
            },
            assignedPassive: {
              oneOf: [
                {
                  $ref: '#/components/schemas/Passive'
                },
                {
                  type: 'null'
                }
              ]
            },
            currentSequence: {
              type: 'string',
              nullable: true,
              description:
                'Current dialog node sequence processed by the answer flow.'
            },
            nextSequence: {
              type: 'string',
              nullable: true,
              description:
                'Next dialog node sequence to render in UI, null when there is no next step.'
            },
            completed: {
              type: 'boolean',
              description:
                'Indicates whether the conversation has reached its terminal step.'
            },
            pointsAwarded: {
              type: 'integer',
              minimum: 0,
              description:
                'Points awarded deterministically from hero metadata according to completion state.'
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
  apis: [
    './src/controllers/*.js',
    './Controller/**/*.js',
    './Router/**/*.js',
    './index.js'
  ] // Paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
