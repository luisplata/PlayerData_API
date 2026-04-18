/**
 * DialogController - Interface Adapter Layer
 * Handles HTTP requests for hero dialog operations.
 * @swagger
 * tags:
 *   name: Hero Dialog
 *   description: Dialog start and answer validation operations
 */
const StartDialogUseCase = require('../useCases/heroes/StartDialogUseCase');
const SendAnswerUseCase = require('../useCases/heroes/SendAnswerUseCase');
const ErrorHandlerMiddleware = require('../middlewares/ErrorHandlerMiddleware');

class DialogController {
  constructor(
    dialogRepository,
    passiveRepository,
    playerPassiveRepository,
    transactionService
  ) {
    this.startDialogUseCase = new StartDialogUseCase(dialogRepository);
    this.sendAnswerUseCase = new SendAnswerUseCase(
      dialogRepository,
      passiveRepository,
      playerPassiveRepository,
      transactionService
    );
  }

  /**
   * @swagger
   * /api/v1/heroes/dialog/start:
   *   post:
   *     summary: Start hero dialog and return public questions
   *     description: Returns dialog metadata and question list without exposing correct answers.
   *     tags: [Hero Dialog]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DialogStartRequest'
   *     responses:
   *       200:
   *         description: Dialog payload returned
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/DialogStartResponseData'
   *       400:
   *         description: Validation error for request body
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
   *         description: Server error while loading dialog
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/v1/heroes/dialog/answer:
   *   post:
   *     summary: Validate dialog answer and assign passive when correct
   *     tags: [Hero Dialog]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DialogAnswerRequest'
   *     responses:
   *       200:
   *         description: Answer processed successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/DialogAnswerResponseData'
   *       400:
   *         description: Validation error for answer payload
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
   *         description: Server error while validating answer
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  sendAnswer = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { playerId, heroId, questionId, answer } = req.body;

    const result = await this.sendAnswerUseCase.execute(
      playerId,
      heroId,
      questionId,
      answer
    );
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
