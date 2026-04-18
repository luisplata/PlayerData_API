const { expect } = require('chai');
const CreateHeroUseCase = require('../../../src/useCases/heroes/CreateHeroUseCase');

describe('CreateHeroUseCase', () => {
  it('creates a hero successfully with valid metadata', async () => {
    const createdHero = {
      id: 1,
      heroId: 'hero-001',
      name: 'Astra',
      metadata: { element: 'light' },
      created_at: new Date('2026-04-17T00:00:00.000Z')
    };

    const heroRepository = {
      create: async (hero) => ({
        id: createdHero.id,
        heroId: hero.heroId,
        name: hero.name,
        metadata: hero.metadata,
        created_at: createdHero.created_at,
        updated_at: createdHero.created_at
      })
    };

    const useCase = new CreateHeroUseCase(heroRepository);
    const result = await useCase.execute('hero-001', 'Astra', { element: 'light' });

    expect(result.success).to.equal(true);
    expect(result.hero).to.include({
      id: 1,
      heroId: 'hero-001',
      name: 'Astra'
    });
    expect(result.hero.metadata).to.deep.equal({ element: 'light' });
    expect(result.hero).to.have.property('created_at');
  });

  it('returns validation error for invalid metadata', async () => {
    const heroRepository = {
      create: async () => {
        throw new Error('should not be called');
      }
    };

    const useCase = new CreateHeroUseCase(heroRepository);
    const result = await useCase.execute('', '', null);

    expect(result.success).to.equal(false);
    expect(result.error).to.equal('Hero ID is required and must be a string');
  });
});
