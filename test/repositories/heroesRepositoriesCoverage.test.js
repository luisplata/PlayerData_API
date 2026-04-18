const { expect } = require('chai');
const HeroRepository = require('../../src/repositories/HeroRepository');
const PassiveRepository = require('../../src/repositories/PassiveRepository');
const DialogRepository = require('../../src/repositories/DialogRepository');
const PlayerPassiveRepository = require('../../src/repositories/PlayerPassiveRepository');

describe('Heroes repositories coverage', () => {
  describe('HeroRepository', () => {
    it('covers list/find success and wrapped create error', async () => {
      const db = (table) => {
        if (table !== 'heroes') throw new Error('unexpected table');

        return {
          insert: async () => {
            throw new Error('insert failed');
          },
          orderBy: async () => ([{ heroId: 'h1' }]),
          where: () => ({ first: async () => ({ heroId: 'h1' }) })
        };
      };

      const repository = new HeroRepository(db);

      const list = await repository.findAll();
      const found = await repository.findByHeroId('h1');

      expect(list).to.deep.equal([{ heroId: 'h1' }]);
      expect(found).to.deep.equal({ heroId: 'h1' });

      try {
        await repository.create({ heroId: 'h1', name: 'Hero', metadata: {}, created_at: new Date(), updated_at: new Date() });
        throw new Error('expected create to fail');
      } catch (error) {
        expect(error.message).to.include('Failed to create hero: insert failed');
      }
    });

    it('covers wrapped find errors', async () => {
      const db = () => ({
        orderBy: async () => {
          throw new Error('list failed');
        },
        where: () => ({
          first: async () => {
            throw new Error('find failed');
          }
        })
      });

      const repository = new HeroRepository(db);

      try {
        await repository.findAll();
        throw new Error('expected findAll to fail');
      } catch (error) {
        expect(error.message).to.include('Failed to find heroes: list failed');
      }

      try {
        await repository.findByHeroId('h1');
        throw new Error('expected findByHeroId to fail');
      } catch (error) {
        expect(error.message).to.include('Failed to find hero by ID: find failed');
      }
    });
  });

  describe('PassiveRepository', () => {
    it('covers create/find methods and wrapped errors', async () => {
      const db = () => ({
        insert: async () => [2],
        orderBy: async () => ([{ passiveId: 'p1' }]),
        where: () => ({
          first: async () => ({ passiveId: 'p1' }),
          orderBy: async () => ([{ passiveId: 'p1', heroId: 'h1' }])
        })
      });

      const repository = new PassiveRepository(db);

      const created = await repository.create({
        passiveId: 'p1',
        heroId: 'h1',
        name: 'Shield',
        metadata: { tier: 'epic' },
        created_at: new Date(),
        updated_at: new Date()
      });
      const list = await repository.findAll();
      const byId = await repository.findByPassiveId('p1');
      const byHero = await repository.findByHeroId('h1');

      expect(created).to.include({ id: 2, passiveId: 'p1', heroId: 'h1' });
      expect(list).to.have.length(1);
      expect(byId).to.include({ passiveId: 'p1' });
      expect(byHero[0]).to.include({ heroId: 'h1' });

      const errorDb = () => ({
        insert: async () => {
          throw new Error('create failed');
        },
        orderBy: async () => {
          throw new Error('all failed');
        },
        where: () => ({
          first: async () => {
            throw new Error('id failed');
          },
          orderBy: async () => {
            throw new Error('hero failed');
          }
        })
      });

      const errorRepository = new PassiveRepository(errorDb);

      await Promise.all([
        errorRepository.create({ passiveId: 'x', heroId: 'h', name: 'n', metadata: {}, created_at: new Date(), updated_at: new Date() }).then(() => {
          throw new Error('expected create fail');
        }).catch((e) => expect(e.message).to.include('Failed to create passive: create failed')),
        errorRepository.findAll().then(() => {
          throw new Error('expected list fail');
        }).catch((e) => expect(e.message).to.include('Failed to find passives: all failed')),
        errorRepository.findByPassiveId('x').then(() => {
          throw new Error('expected by id fail');
        }).catch((e) => expect(e.message).to.include('Failed to find passive by ID: id failed')),
        errorRepository.findByHeroId('h').then(() => {
          throw new Error('expected by hero fail');
        }).catch((e) => expect(e.message).to.include('Failed to find passives by hero: hero failed'))
      ]);
    });
  });

  describe('DialogRepository', () => {
    it('covers no dialog and validateAnswer false branch', async () => {
      const db = (table) => {
        if (table === 'dialogs') {
          return { where: () => ({ first: async () => null }) };
        }
        return { where: () => ({ first: async () => null, orderBy: async () => [] }) };
      };

      const repository = new DialogRepository(db);
      const dialog = await repository.startDialog('h1');
      const answer = await repository.validateAnswer('q1', 'x');

      expect(dialog).to.equal(null);
      expect(answer).to.deep.equal({ valid: false, question: null });
    });

    it('covers wrapped dialog repository errors', async () => {
      const db = (table) => {
        if (table === 'dialogs') {
          return { where: () => ({ first: async () => { throw new Error('dialog failed'); } }) };
        }
        return { where: () => ({ first: async () => { throw new Error('answer failed'); } }) };
      };

      const repository = new DialogRepository(db);

      try {
        await repository.startDialog('h1');
        throw new Error('expected startDialog fail');
      } catch (error) {
        expect(error.message).to.include('Failed to start dialog: dialog failed');
      }

      try {
        await repository.validateAnswer('q1', 'yes');
        throw new Error('expected validateAnswer fail');
      } catch (error) {
        expect(error.message).to.include('Failed to validate answer: answer failed');
      }
    });
  });

  describe('PlayerPassiveRepository', () => {
    it('covers assign existing branch and getByPlayerAndHero', async () => {
      const existing = { id: 9, playerId: 'p1', heroId: 'h1', passiveId: 'pa1' };
      const db = () => ({
        where: () => ({
          first: async () => existing,
          orderBy: async () => [existing]
        }),
        insert: async () => [1]
      });

      const repository = new PlayerPassiveRepository(db);
      const assigned = await repository.assignPassive('p1', 'h1', 'pa1');
      const byPlayer = await repository.getByPlayerId('p1');
      const byPlayerAndHero = await repository.getByPlayerAndHero('p1', 'h1');

      expect(assigned).to.equal(existing);
      expect(byPlayer).to.have.length(1);
      expect(byPlayerAndHero).to.equal(existing);
    });

    it('covers wrapped player passive repository errors', async () => {
      const db = () => ({
        where: () => ({
          first: async () => {
            throw new Error('where failed');
          },
          orderBy: async () => {
            throw new Error('order failed');
          }
        }),
        insert: async () => {
          throw new Error('insert failed');
        }
      });

      const repository = new PlayerPassiveRepository(db);

      await Promise.all([
        repository.assignPassive('p1', 'h1', 'pa1').then(() => {
          throw new Error('expected assign fail');
        }).catch((e) => expect(e.message).to.include('Failed to assign passive: where failed')),
        repository.getByPlayerId('p1').then(() => {
          throw new Error('expected by player fail');
        }).catch((e) => expect(e.message).to.include('Failed to find player passives: order failed')),
        repository.getByPlayerAndHero('p1', 'h1').then(() => {
          throw new Error('expected by player/hero fail');
        }).catch((e) => expect(e.message).to.include('Failed to find player passive by hero: where failed'))
      ]);
    });
  });
});
