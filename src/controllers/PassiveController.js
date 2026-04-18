/**
 * PassiveController - Interface Adapter Layer
 * Handles HTTP requests for passive state operations.
 */
const GetPassiveUseCase = require('../useCases/heroes/GetPassiveUseCase');
const ErrorHandlerMiddleware = require('../middlewares/ErrorHandlerMiddleware');

class PassiveController {
  constructor(playerPassiveRepository, passiveRepository) {
    this.getPassiveUseCase = new GetPassiveUseCase(playerPassiveRepository, passiveRepository);
  }

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