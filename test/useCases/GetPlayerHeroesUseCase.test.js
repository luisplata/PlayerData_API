const { expect } = require('chai');
const GetPlayerHeroesUseCase = require('../../src/useCases/heroes/GetPlayerHeroesUseCase');

describe('GetPlayerHeroesUseCase', () => {
  it('normalizes metadata, calculates progress and includes passive info', async () => {
    const fakeRepo = {
      getAllWithPlayerProgress: async () => [
        {
          id: 1,
          heroId: 'hero-nova',
          name: 'Nova',
          metadata: JSON.stringify({ role: 'support', xpPerLevel: 100 }),
          created_at: new Date(),
          updated_at: new Date(),
          currentXp: 40,
          level: 2,
          passive_passiveId: 'passive-nova-explosion',
          passive_name: 'Explosion',
          passive_metadata: JSON.stringify({ maxLevel: 20, ranges: [{minLevel:1,maxLevel:9,range:1}] })
        }
      ]
    };

    const uc = new GetPlayerHeroesUseCase(fakeRepo);
    const result = await uc.execute('player-1');

    expect(result.success).to.be.true;
    expect(result.heroes).to.be.an('array').with.lengthOf(1);
    const hero = result.heroes[0];
    expect(hero.heroId).to.equal('hero-nova');
    expect(hero.level).to.equal(2);
    expect(hero.currentXp).to.equal(40);
    expect(hero.xpToNextLevel).to.equal(60);
    expect(hero.progressPct).to.equal(40);
    expect(hero.passive).to.be.an('object');
  });
});
