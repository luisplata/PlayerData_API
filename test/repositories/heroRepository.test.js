const { expect } = require('chai');
const HeroRepository = require('../../src/repositories/HeroRepository');
const PassiveRepository = require('../../src/repositories/PassiveRepository');
const DialogRepository = require('../../src/repositories/DialogRepository');
const PlayerPassiveRepository = require('../../src/repositories/PlayerPassiveRepository');

describe('Heroes repositories', () => {
  const createDbStub = (handlers) => {
    const db = (table) => {
      const handler = handlers[table];
      if (!handler) {
        throw new Error(`Unexpected table: ${table}`);
      }
      return handler;
    };

    return db;
  };

  describe('HeroRepository', () => {
    it('creates a hero using the heroes table', async () => {
      let insertedPayload;
      const db = createDbStub({
        heroes: {
          insert: async (payload) => {
            insertedPayload = payload;
            return [7];
          }
        }
      });

      const repository = new HeroRepository(db);
      const createdAt = new Date('2024-01-01T00:00:00.000Z');
      const hero = {
        heroId: 'hero-001',
        name: 'Astra',
        metadata: { element: 'light' },
        created_at: createdAt,
        updated_at: createdAt
      };

      const result = await repository.create(hero);

      expect(insertedPayload).to.deep.equal({
        heroId: 'hero-001',
        name: 'Astra',
        metadata: JSON.stringify({ element: 'light' }),
        created_at: createdAt,
        updated_at: createdAt
      });
      expect(result).to.deep.equal({
        id: 7,
        heroId: 'hero-001',
        name: 'Astra',
        metadata: { element: 'light' },
        created_at: createdAt,
        updated_at: createdAt
      });
    });
  });

  describe('PassiveRepository', () => {
    it('finds passives by hero id', async () => {
      const orderedRows = [{ passiveId: 'p1' }, { passiveId: 'p2' }];
      const db = createDbStub({
        passives: {
          orderBy: async () => orderedRows,
          where: () => ({
            first: async () => orderedRows[0],
            orderBy: async () => orderedRows
          })
        }
      });

      const repository = new PassiveRepository(db);

      const allPassives = await repository.findAll();
      const heroPassives = await repository.findByHeroId('hero-001');

      expect(allPassives).to.equal(orderedRows);
      expect(heroPassives).to.equal(orderedRows);
    });
  });

  describe('DialogRepository', () => {
    it('starts a dialog with questions and validates answers server-side', async () => {
      const db = createDbStub({
        dialogs: {
          where: () => ({
            first: async () => ({ id: 10, heroId: 'hero-001', title: 'Intro', metadata: { mood: 'warm' } })
          })
        },
        dialog_questions: {
          where: () => ({
            first: async () => ({ id: 1, questionId: 'q1', dialogId: 10, question: 'First?', correct_answer: 'Yes', order_index: 1 }),
            orderBy: async () => ([
              { id: 1, questionId: 'q1', dialogId: 10, question: 'First?', correct_answer: 'Yes', order_index: 1 },
              { id: 2, questionId: 'q2', dialogId: 10, question: 'Second?', correct_answer: 'No', order_index: 2 }
            ])
          })
        }
      });

      const repository = new DialogRepository(db);
      const dialog = await repository.startDialog('hero-001');
      const answerResult = await repository.validateAnswer('q1', 'yes');

      expect(dialog).to.deep.equal({
        id: 10,
        heroId: 'hero-001',
        title: 'Intro',
        metadata: { mood: 'warm' },
        questions: [
          { id: 1, questionId: 'q1', dialogId: 10, question: 'First?', order_index: 1 },
          { id: 2, questionId: 'q2', dialogId: 10, question: 'Second?', order_index: 2 }
        ]
      });
      expect(answerResult.valid).to.equal(true);
      expect(answerResult.question).to.have.property('questionId', 'q1');
    });
  });

  describe('PlayerPassiveRepository', () => {
    it('assigns a passive once and reuses the existing relation', async () => {
      let insertedPayload;
      const db = createDbStub({
        player_passives: {
          where: () => ({
            first: async () => null,
            orderBy: async () => ([{ id: 1, playerId: 'player-001' }])
          }),
          insert: async (payload) => {
            insertedPayload = payload;
            return [99];
          }
        }
      });

      const repository = new PlayerPassiveRepository(db);
      const assigned = await repository.assignPassive('player-001', 'hero-001', 'passive-001');
      const passives = await repository.getByPlayerId('player-001');

      expect(insertedPayload.playerId).to.equal('player-001');
      expect(assigned).to.deep.equal({
        id: 99,
        playerId: 'player-001',
        heroId: 'hero-001',
        passiveId: 'passive-001'
      });
      expect(passives).to.deep.equal([{ id: 1, playerId: 'player-001' }]);
    });
  });
});
