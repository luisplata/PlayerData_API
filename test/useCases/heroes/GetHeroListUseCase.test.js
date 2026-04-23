const { expect } = require('chai');
const GetHeroListUseCase = require('../../../src/useCases/heroes/GetHeroListUseCase');

describe('GetHeroListUseCase', () => {
  it('returns hero list successfully', async () => {
    const heroRepository = {
      findAll: async () => [
        {
          heroId: 'hero-001',
          name: 'Astra',
          metadata: JSON.stringify({ element: 'light' })
        },
        { heroId: 'hero-002', name: 'Brann', metadata: { element: 'fire' } }
      ]
    };

    const useCase = new GetHeroListUseCase(heroRepository);
    const result = await useCase.execute();

    expect(result.success).to.equal(true);
    expect(result.heroes).to.have.length(2);
    expect(result.heroes[0]).to.deep.include({
      heroId: 'hero-001',
      name: 'Astra'
    });
    expect(result.heroes[0].metadata).to.deep.equal({ element: 'light' });
  });

  it('returns empty list when there are no heroes', async () => {
    const heroRepository = {
      findAll: async () => []
    };

    const useCase = new GetHeroListUseCase(heroRepository);
    const result = await useCase.execute();

    expect(result.success).to.equal(true);
    expect(result.heroes).to.deep.equal([]);
  });
});
