const { expect } = require('chai');
const SendAnswerUseCase = require('../../../src/useCases/heroes/SendAnswerUseCase');

describe('SendAnswerUseCase', () => {
  it('accepts correct answer and assigns passive once', async () => {
    let assignCalls = 0;
    let addExperienceCalls = 0;

    const dialogRepository = {
      validateAnswer: async () => ({ valid: true }),
      resolveAnswerProgress: async () => ({
        currentSequence: 'question-1',
        nextSequence: 'seq-3',
        completed: false
      })
    };

    const heroRepository = {
      findByHeroId: async () => ({
        heroId: 'hero-001',
        metadata: JSON.stringify({
          xpPerLevel: 100,
          minPointsGainedPerConversation: 1,
          pointsGainedPerConversationComplete: 10
        })
      })
    };

    const passiveRepository = {
      findByHeroId: async () => ([{ passiveId: 'passive-001', heroId: 'hero-001' }])
    };

    const playerPassiveRepository = {
      assignPassive: async () => {
        assignCalls += 1;
        return { id: 1, playerId: 'player-001', heroId: 'hero-001', passiveId: 'passive-001' };
      }
    };

    const playerHeroProgressRepository = {
      addExperience: async (playerId, heroId, experienceGain, xpPerLevel) => {
        addExperienceCalls += 1;
        return { playerId, heroId, level: 1, currentXp: 1, experienceGain, xpPerLevel };
      }
    };

    const transactionService = {
      executeTransaction: async (callback) => callback({})
    };

    const useCase = new SendAnswerUseCase(
      dialogRepository,
      passiveRepository,
      playerPassiveRepository,
      transactionService,
      playerHeroProgressRepository,
      heroRepository
    );

    const result = await useCase.execute('player-001', 'hero-001', 'q1', 'yes');

    expect(result.success).to.equal(true);
    expect(result.correct).to.equal(true);
    expect(result.currentSequence).to.equal('question-1');
    expect(result.nextSequence).to.equal('seq-3');
    expect(result.completed).to.equal(false);
    expect(result.pointsAwarded).to.equal(10);
    expect(result.assignedPassive).to.include({ passiveId: 'passive-001' });
    expect(assignCalls).to.equal(1);
    expect(addExperienceCalls).to.equal(1);
  });

  it('blocks duplicate assignment when passive relation already exists', async () => {
    const dialogRepository = {
      validateAnswer: async () => ({ valid: true }),
      resolveAnswerProgress: async () => ({
        currentSequence: 'question-1',
        nextSequence: 'seq-3',
        completed: false
      })
    };

    const heroRepository = {
      findByHeroId: async () => ({
        heroId: 'hero-001',
        metadata: JSON.stringify({
          xpPerLevel: 100,
          minPointsGainedPerConversation: 1,
          pointsGainedPerConversationComplete: 10
        })
      })
    };

    const passiveRepository = {
      findByHeroId: async () => ([{ passiveId: 'passive-001', heroId: 'hero-001' }])
    };

    const existingRelation = { id: 3, playerId: 'player-001', heroId: 'hero-001', passiveId: 'passive-001' };

    const playerPassiveRepository = {
      assignPassive: async () => existingRelation
    };

    const playerHeroProgressRepository = {
      addExperience: async () => ({ playerId: 'player-001', heroId: 'hero-001', level: 1, currentXp: 1 })
    };

    const transactionService = {
      executeTransaction: async (callback) => callback({})
    };

    const useCase = new SendAnswerUseCase(
      dialogRepository,
      passiveRepository,
      playerPassiveRepository,
      transactionService,
      playerHeroProgressRepository,
      heroRepository
    );

    const first = await useCase.execute('player-001', 'hero-001', 'q1', 'yes');
    const second = await useCase.execute('player-001', 'hero-001', 'q1', 'yes');

    expect(first.success).to.equal(true);
    expect(second.success).to.equal(true);
    expect(first.currentSequence).to.equal('question-1');
    expect(first.nextSequence).to.equal('seq-3');
    expect(first.completed).to.equal(false);
    expect(first.pointsAwarded).to.equal(10);
    expect(first.assignedPassive).to.deep.equal(second.assignedPassive);
  });

  it('returns incorrect when answer is not valid', async () => {
    let addExperienceCalls = 0;

    const dialogRepository = {
      validateAnswer: async () => ({ valid: false }),
      resolveAnswerProgress: async () => ({
        currentSequence: 'question-1',
        nextSequence: 'seq-4',
        completed: false
      })
    };

    const heroRepository = {
      findByHeroId: async () => ({
        heroId: 'hero-001',
        metadata: JSON.stringify({
          xpPerLevel: 100,
          minPointsGainedPerConversation: 2,
          pointsGainedPerConversationComplete: 10
        })
      })
    };

    const passiveRepository = {
      findByHeroId: async () => ([{ passiveId: 'passive-001', heroId: 'hero-001' }])
    };

    const playerPassiveRepository = {
      assignPassive: async () => {
        throw new Error('should not assign on incorrect answer');
      }
    };

    const playerHeroProgressRepository = {
      addExperience: async () => {
        addExperienceCalls += 1;
        return { playerId: 'player-001', heroId: 'hero-001', level: 99, currentXp: 3 };
      }
    };

    const transactionService = {
      executeTransaction: async (callback) => callback({})
    };

    const useCase = new SendAnswerUseCase(
      dialogRepository,
      passiveRepository,
      playerPassiveRepository,
      transactionService,
      playerHeroProgressRepository,
      heroRepository
    );

    const result = await useCase.execute('player-001', 'hero-001', 'q1', 'wrong');

    expect(result.success).to.equal(true);
    expect(result.correct).to.equal(false);
    expect(result.currentSequence).to.equal('question-1');
    expect(result.nextSequence).to.equal('seq-4');
    expect(result.completed).to.equal(false);
    expect(result.pointsAwarded).to.equal(0);
    expect(result.assignedPassive).to.equal(null);
    expect(addExperienceCalls).to.equal(0);
  });

  it('awards completion points when conversation is completed', async () => {
    const dialogRepository = {
      validateAnswer: async () => ({ valid: true }),
      resolveAnswerProgress: async () => ({
        currentSequence: 'seq-6',
        nextSequence: null,
        completed: true
      })
    };

    const passiveRepository = {
      findByHeroId: async () => ([])
    };

    const playerPassiveRepository = {
      assignPassive: async () => null
    };

    let addExperienceCalls = 0;

    const heroRepository = {
      findByHeroId: async () => ({
        heroId: 'hero-001',
        metadata: JSON.stringify({
          xpPerLevel: 100,
          minPointsGainedPerConversation: 2,
          pointsGainedPerConversationComplete: 15
        })
      })
    };

    const transactionService = {
      executeTransaction: async (callback) => callback({})
    };

    const playerHeroProgressRepository = {
      addExperience: async (playerId, heroId, experienceGain, xpPerLevel) => {
        addExperienceCalls += 1;
        return { playerId, heroId, experienceGain, xpPerLevel, level: 2, currentXp: 0 };
      }
    };

    const useCase = new SendAnswerUseCase(
      dialogRepository,
      passiveRepository,
      playerPassiveRepository,
      transactionService,
      playerHeroProgressRepository,
      heroRepository
    );

    const result = await useCase.execute('player-001', 'hero-001', 'q1', 'yes');

    expect(result.success).to.equal(true);
    expect(result.correct).to.equal(true);
    expect(result.currentSequence).to.equal('seq-6');
    expect(result.nextSequence).to.equal(null);
    expect(result.completed).to.equal(true);
    expect(result.pointsAwarded).to.equal(15);
    expect(addExperienceCalls).to.equal(1);
  });
});
