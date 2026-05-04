const { expect } = require('chai');
const GetHeroListUseCase = require('../../src/useCases/heroes/GetHeroListUseCase');

describe('GetHeroListUseCase', () => {
  it('parses hero metadata and attaches passive info when present', async () => {
    const fakeRepo = {
      findAll: async () => [
        {
          id: 1,
          heroId: 'hero-nova',
          name: 'Nova',
          metadata: JSON.stringify({ role: 'support', xpPerLevel: 100 }),
          created_at: new Date(),
          updated_at: new Date(),
          passive_passiveId: 'passive-nova-explosion',
          passive_name: 'Explosion',
          passive_metadata: JSON.stringify({ maxLevel: 20, ranges: [{minLevel:1,maxLevel:9,range:1}] })
        }
      ]
    };

    const uc = new GetHeroListUseCase(fakeRepo);
    const result = await uc.execute();

    expect(result.success).to.be.true;
    expect(result.heroes).to.be.an('array').with.lengthOf(1);
    const hero = result.heroes[0];
    expect(hero.heroId).to.equal('hero-nova');
    expect(hero.metadata).to.be.an('object');
    expect(hero.passive).to.be.an('object');
    expect(hero.passive.passiveId).to.equal('passive-nova-explosion');
    expect(hero.passive.metadata).to.be.an('object');
  });
});
