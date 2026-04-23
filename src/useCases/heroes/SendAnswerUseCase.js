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
    playerHeroProgressRepository = null,
    heroRepository = null
  ) {
    this.dialogRepository = dialogRepository;
    this.passiveRepository = passiveRepository;
    this.playerPassiveRepository = playerPassiveRepository;
    this.transactionService = transactionService || new TransactionService();
    this.playerHeroProgressRepository = playerHeroProgressRepository;
    this.heroRepository = heroRepository;
  }

  static parseMetadata(metadata) {
    if (!metadata) {
      return {};
    }

    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata);
      } catch (error) {
        return {};
      }
    }

    if (typeof metadata === 'object') {
      return metadata;
    }

    return {};
  }

  static asNonNegativeInteger(value) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return 0;
    }

    return parsed;
  }

  static normalizeProgress(progress, fallbackCurrentSequence = null) {
    const currentSequence =
      progress && typeof progress.currentSequence === 'string'
        ? progress.currentSequence
        : fallbackCurrentSequence;

    const hasNextSequence =
      progress &&
      Object.prototype.hasOwnProperty.call(progress, 'nextSequence');
    const nextSequence = hasNextSequence ? progress.nextSequence : null;

    const completed =
      progress && typeof progress.completed === 'boolean'
        ? progress.completed
        : currentSequence !== null && nextSequence === null;

    return {
      currentSequence,
      nextSequence,
      completed
    };
  }

  async resolveProgress(heroId, questionId, answer) {
    if (typeof this.dialogRepository.resolveAnswerProgress !== 'function') {
      return SendAnswerUseCase.normalizeProgress(
        {
          currentSequence: questionId,
          nextSequence: null,
          completed: false
        },
        questionId
      );
    }

    const progress = await this.dialogRepository.resolveAnswerProgress(
      heroId,
      questionId,
      answer
    );

    return SendAnswerUseCase.normalizeProgress(progress, questionId);
  }

  async resolvePointsAwarded(heroId, isCorrect) {
    if (
      !this.heroRepository ||
      typeof this.heroRepository.findByHeroId !== 'function'
    ) {
      return 0;
    }

    const hero = await this.heroRepository.findByHeroId(heroId);
    if (!hero) {
      return 0;
    }

    const metadata = SendAnswerUseCase.parseMetadata(hero.metadata);
    if (isCorrect) {
      return SendAnswerUseCase.asNonNegativeInteger(
        metadata.pointsGainedPerConversationComplete
      );
    }

    return 0;
  }

  async execute(playerId, heroId, questionId, answer) {
    try {
      return await this.transactionService.executeTransaction(async () => {
        const validation = await this.dialogRepository.validateAnswer(
          questionId,
          answer
        );
        const progress = await this.resolveProgress(heroId, questionId, answer);
        const pointsAwarded = await this.resolvePointsAwarded(
          heroId,
          validation.valid
        );

        if (!validation.valid) {
          return {
            success: true,
            correct: false,
            assignedPassive: null,
            currentSequence: progress.currentSequence,
            nextSequence: progress.nextSequence,
            completed: progress.completed,
            pointsAwarded
          };
        }

        if (
          this.playerHeroProgressRepository &&
          typeof this.playerHeroProgressRepository.addExperience === 'function'
        ) {
          const hero =
            this.heroRepository &&
            typeof this.heroRepository.findByHeroId === 'function'
              ? await this.heroRepository.findByHeroId(heroId)
              : null;
          const heroMetadata = SendAnswerUseCase.parseMetadata(
            hero ? hero.metadata : null
          );
          const xpPerLevel = SendAnswerUseCase.asNonNegativeInteger(
            heroMetadata.xpPerLevel
          );

          if (xpPerLevel > 0) {
            await this.playerHeroProgressRepository.addExperience(
              playerId,
              heroId,
              pointsAwarded,
              xpPerLevel
            );
          }
        } else if (
          this.playerHeroProgressRepository &&
          typeof this.playerHeroProgressRepository.incrementLevel === 'function'
        ) {
          await this.playerHeroProgressRepository.incrementLevel(
            playerId,
            heroId
          );
        }

        const passives = await this.passiveRepository.findByHeroId(heroId);
        if (!passives || passives.length === 0) {
          return {
            success: true,
            correct: true,
            assignedPassive: null,
            currentSequence: progress.currentSequence,
            nextSequence: progress.nextSequence,
            completed: progress.completed,
            pointsAwarded
          };
        }

        const selectedPassive = passives[0];
        const assignedPassive =
          await this.playerPassiveRepository.assignPassive(
            playerId,
            heroId,
            selectedPassive.passiveId
          );

        return {
          success: true,
          correct: true,
          assignedPassive,
          currentSequence: progress.currentSequence,
          nextSequence: progress.nextSequence,
          completed: progress.completed,
          pointsAwarded
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
