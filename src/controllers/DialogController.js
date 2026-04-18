/**
 * DialogController - Interface Adapter Layer
 * Handles HTTP requests for hero dialog operations.
 */
const StartDialogUseCase = require('../useCases/heroes/StartDialogUseCase');
const SendAnswerUseCase = require('../useCases/heroes/SendAnswerUseCase');
const ErrorHandlerMiddleware = require('../middlewares/ErrorHandlerMiddleware');

class DialogController {
  constructor(dialogRepository, passiveRepository, playerPassiveRepository, transactionService) {
    this.startDialogUseCase = new StartDialogUseCase(dialogRepository);
    this.sendAnswerUseCase = new SendAnswerUseCase(
      dialogRepository,
      passiveRepository,
      playerPassiveRepository,
      transactionService
    );
  }

  startDialog = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { heroId } = req.body;

    const result = await this.startDialogUseCase.execute(heroId);
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
      data: result.dialog
    });
  });

  sendAnswer = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { playerId, heroId, questionId, answer } = req.body;

    const result = await this.sendAnswerUseCase.execute(playerId, heroId, questionId, answer);
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
        correct: result.correct,
        assignedPassive: result.assignedPassive
      }
    });
  });
}

module.exports = DialogController;