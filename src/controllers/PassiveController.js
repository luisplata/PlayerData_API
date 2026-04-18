/**
 * PassiveController - Interface Adapter Layer
 * Handles HTTP requests for passive state operations.
 * @swagger
 * tags:
 *   name: Hero Passives
 *   description: Player passive state and passive catalog endpoints
 */
const GetPassiveUseCase = require('../useCases/heroes/GetPassiveUseCase');
const ErrorHandlerMiddleware = require('../middlewares/ErrorHandlerMiddleware');

class PassiveController {
  constructor(playerPassiveRepository, passiveRepository) {
    this.getPassiveUseCase = new GetPassiveUseCase(playerPassiveRepository, passiveRepository);
  }

  /**
   * @swagger
   * /api/v1/heroes/passive/{playerId}:
   *   get:
   *     summary: Get player's assigned passive and passive catalog
   *     tags: [Hero Passives]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: playerId
   *         required: true
   *         schema:
   *           type: string
   *           pattern: '^[a-zA-Z0-9_-]+$'
   *         description: Player unique identifier
   *     responses:
   *       200:
   *         description: Passive state returned successfully
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
   *                         assignedPassive:
   *                           oneOf:
   *                             - $ref: '#/components/schemas/Passive'
   *                             - type: 'null'
   *                         catalog:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/Passive'
   *       400:
   *         description: Validation error for player identifier
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Missing or invalid bearer token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error while retrieving passive state
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getPassive = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { playerId } = req.params;

    const result = await this.getPassiveUseCase.execute(playerId);
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: {
          message: result.error,
          statusCode: 500
        }
      });
    }

    res.json({
      success: true,
      data: {
        assignedPassive: result.assignedPassive,
        catalog: result.catalog
      }
    });
  });
}

module.exports = PassiveController;