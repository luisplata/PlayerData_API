/**
 * PlayerController - Interface Adapter Layer
 * Handles HTTP requests for Player operations
 * @swagger
 * tags:
 *   name: Players
 *   description: Player management operations
 */
const LoginPlayerUseCase = require('../useCases/player/LoginPlayerUseCase');
const CreatePlayerUseCase = require('../useCases/player/CreatePlayerUseCase');
const ErrorHandlerMiddleware = require('../middlewares/ErrorHandlerMiddleware');

class PlayerController {
  constructor(playerRepository, jwtService, battlePassRepository, playerRewardRepository, battlePassRewardRepository) {
    this.loginPlayerUseCase = new LoginPlayerUseCase(playerRepository, jwtService);
    this.createPlayerUseCase = new CreatePlayerUseCase(
      playerRepository,
      battlePassRepository,
      playerRewardRepository,
      battlePassRewardRepository
    );
    this.playerRepository = playerRepository;
  }

  /**
   * @swagger
   * /api/v1/player/login:
   *   post:
   *     summary: Player login
   *     tags: [Players]
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
   *     responses:
   *       200:
   *         description: Login successful
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
   *                         token:
   *                           type: string
   *                           description: JWT authentication token
   *                         player:
   *                           $ref: '#/components/schemas/Player'
   *       401:
   *         description: Invalid player ID
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
    const { playerId } = req.body;
    
    const result = await this.loginPlayerUseCase.execute(playerId);
    
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
      data: {
        token: result.token,
        player: result.player
      }
    });
  });

  createPlayer = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { playerId, nickname, key } = req.body;
    
    const result = await this.createPlayerUseCase.execute(playerId, nickname, key);
    
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
    
    const statusCode = result.message.includes('created') ? 201 : 200;
    res.status(statusCode).json({
      success: true,
      message: result.message,
      data: result.player
    });
  });

  validateNickname = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { nickname } = req.params;
    
    try {
      const isAvailable = await this.playerRepository.isNicknameAvailable(nickname);
      res.json({
        success: true,
        data: {
          available: isAvailable
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: `Error while validating nickname: ${nickname}`,
          statusCode: 500
        }
      });
    }
  });

  getPlayerIdByNickname = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { nickname } = req.params;
    
    try {
      const player = await this.playerRepository.findByNickname(nickname);
      if (!player) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Player not found: ${nickname}`,
            statusCode: 404
          }
        });
      }
      
      res.json({
        success: true,
        data: {
          playerId: player.playerId
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: `Error while getting player ID: ${nickname}`,
          statusCode: 500
        }
      });
    }
  });

  getPlayerById = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { playerId } = req.params;
    
    try {
      const player = await this.playerRepository.findByPlayerId(playerId);
      if (!player) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Player not found: ${playerId}`,
            statusCode: 404
          }
        });
      }
      
      res.json({
        success: true,
        data: player
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: `Error while getting player by ID: ${playerId}`,
          statusCode: 500
        }
      });
    }
  });

  updatePlayerNickname = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { playerId } = req.params;
    const { nickname } = req.body;
    
    try {
      // Check if nickname is available
      const isAvailable = await this.playerRepository.isNicknameAvailable(nickname);
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Nickname already in use: ${nickname}`,
            statusCode: 400
          }
        });
      }
      
      const updatedRows = await this.playerRepository.updateNickname(playerId, nickname);
      
      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Player not found: ${playerId}`,
            statusCode: 404
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Nickname updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: `Error while updating nickname: ${error.message}`,
          statusCode: 500
        }
      });
    }
  });
}

module.exports = PlayerController;
