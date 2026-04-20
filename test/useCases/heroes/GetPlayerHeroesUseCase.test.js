const { expect } = require('chai');
const GetPlayerHeroesUseCase = require('../../../src/useCases/heroes/GetPlayerHeroesUseCase');

describe('GetPlayerHeroesUseCase', () => {
  it('returns full hero catalog with default level 0 when there is no player progress', async () => {
    const heroRepository = {
      getAllWithPlayerProgress: async () => ([
        { heroId: 'hero-001', name: 'Astra', metadata: '{"role":"support"}', level: null },
        { heroId: 'hero-002', name: 'Blaze', metadata: '{"role":"tank"}', level: null }
      ])
    };

    const useCase = new GetPlayerHeroesUseCase(heroRepository);
    const result = await useCase.execute('player-001');

    expect(result.success).to.equal(true);
    expect(result.heroes).to.have.length(2);
    expect(result.heroes[0]).to.include({ heroId: 'hero-001', level: 0 });
    expect(result.heroes[1]).to.include({ heroId: 'hero-002', level: 0 });
    expect(result.heroes[0].metadata).to.deep.equal({ role: 'support' });
    expect(result.heroes[1].metadata).to.deep.equal({ role: 'tank' });
  });

  it('returns mixed progress preserving stored levels and defaults for missing rows', async () => {
    const heroRepository = {
      getAllWithPlayerProgress: async () => ([
        { heroId: 'hero-001', name: 'Astra', metadata: { role: 'support' }, level: 4 },
        { heroId: 'hero-002', name: 'Blaze', metadata: { role: 'tank' }, level: null }
      ])
    };

    const useCase = new GetPlayerHeroesUseCase(heroRepository);
    const result = await useCase.execute('player-001');

    expect(result.success).to.equal(true);
    expect(result.heroes).to.have.length(2);
    expect(result.heroes[0]).to.include({ heroId: 'hero-001', level: 4 });
    expect(result.heroes[1]).to.include({ heroId: 'hero-002', level: 0 });
  });

  it('returns progression metadata fields when present on heroes', async () => {
    const heroRepository = {
      getAllWithPlayerProgress: async () => ([
        {
          heroId: 'hero-010',
          name: 'Nova',
          metadata: JSON.stringify({
            xpPerLevel: 100,
            pointsLostPerGame: 2,
            minPointsGainedPerConversation: 1,
            pointsGainedPerConversationComplete: 10
          }),
          level: 1
        }
      ])
    };

    const useCase = new GetPlayerHeroesUseCase(heroRepository);
    const result = await useCase.execute('player-001');

    expect(result.success).to.equal(true);
    expect(result.heroes).to.have.length(1);
    expect(result.heroes[0].metadata).to.deep.equal({
      xpPerLevel: 100,
      pointsLostPerGame: 2,
      minPointsGainedPerConversation: 1,
      pointsGainedPerConversationComplete: 10
    });
  });

  it('fills missing progression metadata fields with defaults when progression is partially configured', async () => {
    const heroRepository = {
      getAllWithPlayerProgress: async () => ([
        {
          heroId: 'hero-011',
          name: 'Pulse',
          metadata: JSON.stringify({
            role: 'support',
            xpPerLevel: 120
          }),
          level: 2
        }
      ])
    };

    const useCase = new GetPlayerHeroesUseCase(heroRepository);
    const result = await useCase.execute('player-001');

    expect(result.success).to.equal(true);
    expect(result.heroes).to.have.length(1);
    expect(result.heroes[0].metadata).to.deep.equal({
      role: 'support',
      xpPerLevel: 120,
      pointsLostPerGame: 0,
      minPointsGainedPerConversation: 0,
      pointsGainedPerConversationComplete: 0
    });
  });

  it('returns failure when repository throws an error', async () => {
    const heroRepository = {
      getAllWithPlayerProgress: async () => {
        throw new Error('db unavailable');
      }
    };

    const useCase = new GetPlayerHeroesUseCase(heroRepository);
    const result = await useCase.execute('player-001');

    expect(result.success).to.equal(false);
    expect(result.error).to.include('db unavailable');
  });
});