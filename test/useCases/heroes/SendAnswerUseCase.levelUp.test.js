const { expect } = require('chai');
const SendAnswerUseCase = require('../../../src/useCases/heroes/SendAnswerUseCase');

describe('SendAnswerUseCase — level-up parameters', () => {
  it('calls addExperience with correct xpPerLevel and pointsAwarded when answer is correct (metadata as string)', async () => {
    let addExperienceCalled = false;
    let receivedArgs = null;

    const dialogRepository = {
      validateAnswer: async () => ({ valid: true }),
      resolveAnswerProgress: async () => ({ currentSequence: 'q1', nextSequence: null, completed: true })
    };

    const heroRepository = {
      findByHeroId: async () => ({
        heroId: 'hero-x',
        metadata: JSON.stringify({ xpPerLevel: 100, pointsGainedPerConversationComplete: 10 })
      })
    };

    const passiveRepository = { findByHeroId: async () => [] };

    const playerPassiveRepository = { assignPassive: async () => null };

    const playerHeroProgressRepository = {
      addExperience: async (playerId, heroId, experienceGain, xpPerLevel) => {
        addExperienceCalled = true;
        receivedArgs = { playerId, heroId, experienceGain, xpPerLevel };
        return { playerId, heroId, level: 1, currentXp: 0, levelsGained: 1 };
      }
    };

    const transactionService = { executeTransaction: async cb => cb({}) };

    const useCase = new SendAnswerUseCase(
      dialogRepository,
      passiveRepository,
      playerPassiveRepository,
      transactionService,
      playerHeroProgressRepository,
      heroRepository
    );

    const result = await useCase.execute('player-123', 'hero-x', 'q1', 'yes');

    expect(result.success).to.equal(true);
    expect(result.correct).to.equal(true);
    expect(result.pointsAwarded).to.equal(10);
    expect(addExperienceCalled).to.equal(true);
    expect(receivedArgs).to.deep.equal({
      playerId: 'player-123',
      heroId: 'hero-x',
      experienceGain: 10,
      xpPerLevel: 100
    });
  });

  it('parses metadata object and still calls addExperience correctly (metadata as object)', async () => {
    let received = null;

    const dialogRepository = {
      validateAnswer: async () => ({ valid: true }),
      resolveAnswerProgress: async () => ({ currentSequence: 'q2', nextSequence: null, completed: true })
    };

    const heroRepository = {
      findByHeroId: async () => ({
        heroId: 'hero-y',
        metadata: { xpPerLevel: 50, pointsGainedPerConversationComplete: 5 }
      })
    };

    const passiveRepository = { findByHeroId: async () => [] };
    const playerPassiveRepository = { assignPassive: async () => null };

    const playerHeroProgressRepository = {
      addExperience: async (playerId, heroId, experienceGain, xpPerLevel) => {
        received = { playerId, heroId, experienceGain, xpPerLevel };
        return { playerId, heroId, level: 0, currentXp: 0, levelsGained: 0 };
      }
    };

    const transactionService = { executeTransaction: async cb => cb({}) };

    const useCase = new SendAnswerUseCase(
      dialogRepository,
      passiveRepository,
      playerPassiveRepository,
      transactionService,
      playerHeroProgressRepository,
      heroRepository
    );

    const result = await useCase.execute('player-999', 'hero-y', 'q2', 'yes');

    expect(result.success).to.equal(true);
    expect(result.pointsAwarded).to.equal(5);
    expect(received).to.deep.equal({
      playerId: 'player-999',
      heroId: 'hero-y',
      experienceGain: 5,
      xpPerLevel: 50
    });
  });
});
