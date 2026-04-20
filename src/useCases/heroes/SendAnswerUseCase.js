const TransactionService = require('../../services/TransactionService');

/**
 * SendAnswerUseCase - Use Case Layer
 * Validates answers and assigns a passive atomically when correct.
 */
class SendAnswerUseCase {
  constructor(
    dialogRepository,
    passiveRepository,
    playerPassiveRepository,
    transactionService = null,
    playerHeroProgressRepository = null
  ) {
    this.dialogRepository = dialogRepository;
    this.passiveRepository = passiveRepository;
    this.playerPassiveRepository = playerPassiveRepository;
    this.transactionService = transactionService || new TransactionService();
    this.playerHeroProgressRepository = playerHeroProgressRepository;
  }

  async execute(playerId, heroId, questionId, answer) {
    try {
      return await this.transactionService.executeTransaction(async () => {
        const validation = await this.dialogRepository.validateAnswer(questionId, answer);

        if (!validation.valid) {
          return {
            success: true,
            correct: false,
            assignedPassive: null
          };
        }

        if (
          this.playerHeroProgressRepository &&
          typeof this.playerHeroProgressRepository.incrementLevel === 'function'
        ) {
          await this.playerHeroProgressRepository.incrementLevel(playerId, heroId);
        }

        const passives = await this.passiveRepository.findByHeroId(heroId);
        if (!passives || passives.length === 0) {
          return {
            success: true,
            correct: true,
            assignedPassive: null
          };
        }

        const selectedPassive = passives[0];
        const assignedPassive = await this.playerPassiveRepository.assignPassive(
          playerId,
          heroId,
          selectedPassive.passiveId
        );

        return {
          success: true,
          correct: true,
          assignedPassive
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = SendAnswerUseCase;