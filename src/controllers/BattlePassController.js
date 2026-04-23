/**
 * BattlePassController - Interface Adapter Layer
 * Handles HTTP requests for BattlePass operations
 * @swagger
 * tags:
 *   name: Battle Pass
 *   description: Battle pass progression and rewards endpoints
 */
const AddExperienceUseCase = require('../useCases/battlePass/AddExperienceUseCase');
const ErrorHandlerMiddleware = require('../middlewares/ErrorHandlerMiddleware');

class BattlePassController {
  constructor(
    battlePassRepository,
    playerRewardRepository,
    battlePassRewardRepository
  ) {
    this.addExperienceUseCase = new AddExperienceUseCase(
      battlePassRepository,
      playerRewardRepository,
      battlePassRewardRepository
    );
    this.battlePassRepository = battlePassRepository;
    this.playerRewardRepository = playerRewardRepository;
  }

  /**
   * @swagger
   * /api/v1/battle-pass/{playerId}:
   *   get:
   *     summary: Get battle pass data and rewards by playerId
   *     tags: [Battle Pass]
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
   *         description: Battle pass and rewards payload
   *       401:
   *         description: Missing or invalid token
   *       404:
   *         description: Battle pass not found
   *       500:
   *         description: Server error
   */
  getBattlePassByPlayerId = ErrorHandlerMiddleware.asyncHandler(
    async (req, res) => {
      const { playerId } = req.params;

      try {
        const battlePass =
          await this.battlePassRepository.findByPlayerId(playerId);
        if (!battlePass) {
          return res.status(404).json({
            success: false,
            error: {
              message: 'Battle pass not found for player',
              statusCode: 404
            }
          });
        }

        // Get player rewards
        const rewards =
          await this.playerRewardRepository.findByPlayerId(playerId);

        res.json({
          success: true,
          data: {
            battlePass,
            rewards
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            message: 'Error while getting battle pass',
            statusCode: 500
          }
        });
      }
    }
  );

  /**
   * @swagger
   * /api/v1/battle-pass/experience:
   *   post:
   *     summary: Add experience to a player's battle pass
   *     tags: [Battle Pass]
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
   *         description: Experience added and battle pass updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Missing or invalid token
   *       500:
   *         description: Server error
   */
  addExperience = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { playerId, experience } = req.body;

    const result = await this.addExperienceUseCase.execute(
      playerId,
      experience
    );

    if (!result.success) {
      const statusCode =
        result.error.includes('required') || result.error.includes('must be')
          ? 400
          : 500;
      return res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          statusCode
        }
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  });
}

module.exports = BattlePassController;
