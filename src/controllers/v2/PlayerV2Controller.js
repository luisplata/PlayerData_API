/**
 * PlayerV2Controller - Interface Adapter Layer
 * Enhanced HTTP handlers for Player operations in API v2
 * @swagger
 * tags:
 *   name: Players V2
 *   description: Enhanced player management operations for API v2
 */
const LoginPlayerV2UseCase = require('../../useCases/v2/player/LoginPlayerV2UseCase');
const CreatePlayerV2UseCase = require('../../useCases/v2/player/CreatePlayerV2UseCase');
const ErrorHandlerMiddleware = require('../../middlewares/ErrorHandlerMiddleware');

class PlayerV2Controller {
  constructor(playerRepository, authServiceV2, battlePassRepository, playerRewardRepository, battlePassRewardRepository) {
    this.loginPlayerV2UseCase = new LoginPlayerV2UseCase(playerRepository, authServiceV2);
    this.createPlayerV2UseCase = new CreatePlayerV2UseCase(
      playerRepository,
      battlePassRepository,
      playerRewardRepository,
      battlePassRewardRepository
    );
    this.playerRepository = playerRepository;
    this.authServiceV2 = authServiceV2;
  }

  /**
   * @swagger
   * /api/v2/player/login:
   *   post:
   *     summary: Enhanced player login with refresh tokens
   *     tags: [Players V2]
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
   *                 description: Player unique identifier
   *                 example: "player123"
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Player email (optional, for additional verification)
   *                 example: "player@example.com"
   *     responses:
   *       200:
   *         description: Login successful with enhanced authentication
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
   *                         player:
   *                           type: object
   *                           properties:
   *                             id:
   *                               type: integer
   *                             playerId:
   *                               type: string
   *                             nickname:
   *                               type: string
   *                             email:
   *                               type: string
   *                             avatar:
   *                               type: string
   *                             preferences:
   *                               type: object
   *                             statistics:
   *                               type: object
   *                         authentication:
   *                           type: object
   *                           properties:
   *                             accessToken:
   *                               type: string
   *                             refreshToken:
   *                               type: string
   *                             tokenType:
   *                               type: string
   *                             expiresIn:
   *                               type: string
   *                             refreshExpiresIn:
   *                               type: string
   *                             sessionId:
   *                               type: string
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  login = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { playerId, email } = req.body;
    
    const result = await this.loginPlayerV2UseCase.execute(playerId, email);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: {
          message: result.error,
          statusCode: 401
        }
      });
    }
    
    res.json({
      success: true,
      data: result.data
    });
  });

  /**
   * @swagger
   * /api/v2/player:
   *   post:
   *     summary: Create player with enhanced profile
   *     tags: [Players V2]
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
   *                 description: Player unique identifier
   *                 example: "player123"
   *               nickname:
   *                 type: string
   *                 description: Player display name
   *                 example: "PlayerOne"
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Player email address
   *                 example: "player@example.com"
   *               avatar:
   *                 type: string
   *                 format: uri
   *                 description: Player avatar URL
   *                 example: "https://example.com/avatar.jpg"
   *               preferences:
   *                 type: object
   *                 description: Player preferences
   *                 properties:
   *                   theme:
   *                     type: string
   *                     enum: [light, dark]
   *                   language:
   *                     type: string
   *                     example: "en"
   *                   notifications:
   *                     type: boolean
   *                   privacy:
   *                     type: string
   *                     enum: [public, friends, private]
   *               key:
   *                 type: string
   *                 description: API key for authentication
   *                 example: "your_api_key"
   *     responses:
   *       201:
   *         description: Player created successfully
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
   *                         player:
   *                           type: object
   *                         action:
   *                           type: string
   *                           enum: [created, updated, existing]
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  createPlayer = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { playerId, nickname, email, avatar, preferences, key } = req.body;
    
    const result = await this.createPlayerV2UseCase.execute(
      playerId, 
      nickname, 
      email, 
      avatar, 
      preferences, 
      key
    );
    
    if (!result.success) {
      const statusCode = result.error.includes('Unauthorized') ? 401 : 400;
      return res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          statusCode
        }
      });
    }
    
    const statusCode = result.data.action === 'created' ? 201 : 200;
    res.status(statusCode).json({
      success: true,
      message: result.message,
      data: result.data
    });
  });

  /**
   * @swagger
   * /api/v2/player/refresh:
   *   post:
   *     summary: Refresh access token
   *     tags: [Players V2]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 description: Valid refresh token
   *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *     responses:
   *       200:
   *         description: Token refreshed successfully
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
   *                         accessToken:
   *                           type: string
   *                         tokenType:
   *                           type: string
   *                         expiresIn:
   *                           type: string
   *       401:
   *         description: Invalid refresh token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  refreshToken = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    try {
      const result = this.authServiceV2.refreshAccessToken(refreshToken);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 401
        }
      });
    }
  });

  /**
   * @swagger
   * /api/v2/player/profile:
   *   get:
   *     summary: Get player profile
   *     tags: [Players V2]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Player profile retrieved successfully
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
   *                         player:
   *                           type: object
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getProfile = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { playerId } = req.user;
    
    try {
      const player = await this.playerRepository.findByPlayerId(playerId);
      if (!player) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Player not found',
            statusCode: 404
          }
        });
      }
      
      res.json({
        success: true,
        data: {
          player: player.toFullProfile ? player.toFullProfile() : player
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Error while getting player profile',
          statusCode: 500
        }
      });
    }
  });
}

module.exports = PlayerV2Controller;
