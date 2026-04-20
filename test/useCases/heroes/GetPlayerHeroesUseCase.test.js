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