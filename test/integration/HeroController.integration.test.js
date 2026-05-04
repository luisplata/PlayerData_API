const { expect } = require('chai');

const HeroController = require('../../src/controllers/HeroController');

describe('HeroController Integration-like tests', () => {
  function makeFakeRes() {
    let statusCode = 200;
    const body = {};
    return {
      status(code) {
        statusCode = code;
        return this;
      },
      json(obj) {
        Object.assign(body, obj);
        this._body = obj;
        this._status = statusCode;
      },
      _getBody() {
        return body;
      },
      _getStatus() {
        return statusCode;
      }
    };
  }

  it('getHeroList returns heroes with passive info', async () => {
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
          passive_metadata: JSON.stringify({ maxLevel: 20 })
        }
      ]
    };

    const controller = new HeroController(fakeRepo);
    const req = {};
    const res = makeFakeRes();

    await controller.getHeroList(req, res);

    const resp = res._getBody();
    expect(resp.success).to.be.true;
    expect(resp.data.heroes).to.be.an('array').with.lengthOf(1);
    expect(resp.data.heroes[0].passive).to.be.an('object');
  });

  it('getPlayerHeroes returns player heroes with passive and progress', async () => {
    const fakeRepo = {
      getAllWithPlayerProgress: async () => [
        {
          id: 1,
          heroId: 'hero-nova',
          name: 'Nova',
          metadata: JSON.stringify({ role: 'support', xpPerLevel: 100 }),
          created_at: new Date(),
          updated_at: new Date(),
          currentXp: 10,
          level: 1,
          passive_passiveId: 'passive-nova-explosion',
          passive_name: 'Explosion',
          passive_metadata: JSON.stringify({ maxLevel: 20 })
        }
      ]
    };

    const controller = new HeroController(fakeRepo);
    const req = { params: { playerId: 'player-1' } };
    const res = makeFakeRes();

    await controller.getPlayerHeroes(req, res);

    const resp = res._getBody();
    expect(resp.success).to.be.true;
    expect(resp.data.heroes).to.be.an('array').with.lengthOf(1);
    const hero = resp.data.heroes[0];
    expect(hero.currentXp).to.equal(10);
    expect(hero.passive).to.be.an('object');
  });
});
