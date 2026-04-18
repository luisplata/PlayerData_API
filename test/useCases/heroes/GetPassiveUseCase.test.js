const { expect } = require('chai');
const GetPassiveUseCase = require('../../../src/useCases/heroes/GetPassiveUseCase');

describe('GetPassiveUseCase', () => {
  it('returns assigned passive and catalog for player with passive', async () => {
    const playerPassiveRepository = {
      getByPlayerId: async () => ([{ playerId: 'player-001', heroId: 'hero-001', passiveId: 'passive-001' }])
    };

    const passiveRepository = {
      findAll: async () => ([
        { passiveId: 'passive-001', name: 'Shield' },
        { passiveId: 'passive-002', name: 'Boost' }
      ])
    };

    const useCase = new GetPassiveUseCase(playerPassiveRepository, passiveRepository);
    const result = await useCase.execute('player-001');

    expect(result.success).to.equal(true);
    expect(result.assignedPassive).to.deep.equal({ playerId: 'player-001', heroId: 'hero-001', passiveId: 'passive-001' });
    expect(result.catalog).to.have.length(2);
  });

  it('returns null assigned passive and catalog when player has no passive', async () => {
    const playerPassiveRepository = {
      getByPlayerId: async () => ([])
    };

    const passiveRepository = {
      findAll: async () => ([{ passiveId: 'passive-001', name: 'Shield' }])
    };

    const useCase = new GetPassiveUseCase(playerPassiveRepository, passiveRepository);
    const result = await useCase.execute('player-002');

    expect(result.success).to.equal(true);
    expect(result.assignedPassive).to.equal(null);
    expect(result.catalog).to.have.length(1);
  });
});
