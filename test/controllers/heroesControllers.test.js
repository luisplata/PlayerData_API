const { expect } = require('chai');
const HeroController = require('../../src/controllers/HeroController');
const DialogController = require('../../src/controllers/DialogController');
const PassiveController = require('../../src/controllers/PassiveController');

function createResponseMock() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

describe('Heroes controllers coverage', () => {
  it('covers HeroController success and failure branches', async () => {
    const repository = {
      create: async () => ({
        id: 1,
        heroId: 'hero_1',
        name: 'Hero',
        metadata: {}
      }),
      findAll: async () => [{ heroId: 'hero_1' }]
    };

    const controller = new HeroController(repository);

    const resCreateSuccess = createResponseMock();
    controller.createHero(
      { body: { heroId: 'hero_1', name: 'Hero', metadata: {} } },
      resCreateSuccess,
      () => {}
    );
    await new Promise(r => setImmediate(r));

    expect(resCreateSuccess.statusCode).to.equal(201);
    expect(resCreateSuccess.body.success).to.equal(true);

    controller.createHeroUseCase = {
      execute: async () => ({ success: false, error: 'bad hero' })
    };
    const resCreateFail = createResponseMock();
    controller.createHero(
      { body: { heroId: 'x', name: 'x' } },
      resCreateFail,
      () => {}
    );
    await new Promise(r => setImmediate(r));

    expect(resCreateFail.statusCode).to.equal(400);
    expect(resCreateFail.body.success).to.equal(false);

    const resListSuccess = createResponseMock();
    controller.getHeroList({}, resListSuccess, () => {});
    await new Promise(r => setImmediate(r));

    expect(resListSuccess.statusCode).to.equal(200);
    expect(resListSuccess.body.success).to.equal(true);

    controller.getHeroListUseCase = {
      execute: async () => ({ success: false, error: 'list fail' })
    };
    const resListFail = createResponseMock();
    controller.getHeroList({}, resListFail, () => {});
    await new Promise(r => setImmediate(r));

    expect(resListFail.statusCode).to.equal(500);
    expect(resListFail.body.success).to.equal(false);
  });

  it('covers DialogController success and failure branches', async () => {
    const dialogRepository = {
      startDialog: async () => ({ id: 1, questions: [] }),
      validateAnswer: async () => ({ valid: true })
    };
    const passiveRepository = {
      findByHeroId: async () => [{ passiveId: 'p1' }]
    };
    const playerPassiveRepository = {
      assignPassive: async () => ({ passiveId: 'p1' })
    };
    const transactionService = {
      executeTransaction: async callback => callback({})
    };

    const controller = new DialogController(
      dialogRepository,
      passiveRepository,
      playerPassiveRepository,
      transactionService
    );

    const resStartSuccess = createResponseMock();
    controller.startDialog(
      { body: { heroId: 'h1' } },
      resStartSuccess,
      () => {}
    );
    await new Promise(r => setImmediate(r));
    expect(resStartSuccess.statusCode).to.equal(200);

    controller.startDialogUseCase = {
      execute: async () => ({ success: false, error: 'dialog fail' })
    };
    const resStartFail = createResponseMock();
    controller.startDialog({ body: { heroId: 'h1' } }, resStartFail, () => {});
    await new Promise(r => setImmediate(r));
    expect(resStartFail.statusCode).to.equal(500);

    const resAnswerSuccess = createResponseMock();
    controller.sendAnswer(
      {
        body: { playerId: 'p1', heroId: 'h1', questionId: 'q1', answer: 'yes' }
      },
      resAnswerSuccess,
      () => {}
    );
    await new Promise(r => setImmediate(r));
    expect(resAnswerSuccess.statusCode).to.equal(200);

    controller.sendAnswerUseCase = {
      execute: async () => ({ success: false, error: 'answer fail' })
    };
    const resAnswerFail = createResponseMock();
    controller.sendAnswer(
      {
        body: { playerId: 'p1', heroId: 'h1', questionId: 'q1', answer: 'yes' }
      },
      resAnswerFail,
      () => {}
    );
    await new Promise(r => setImmediate(r));
    expect(resAnswerFail.statusCode).to.equal(500);
  });

  it('covers PassiveController success and failure branches', async () => {
    const playerPassiveRepository = {
      getByPlayerId: async () => []
    };
    const passiveRepository = {
      findAll: async () => [{ passiveId: 'p1' }]
    };

    const controller = new PassiveController(
      playerPassiveRepository,
      passiveRepository
    );

    const resSuccess = createResponseMock();
    controller.getPassive({ params: { playerId: 'p1' } }, resSuccess, () => {});
    await new Promise(r => setImmediate(r));
    expect(resSuccess.statusCode).to.equal(200);
    expect(resSuccess.body.success).to.equal(true);

    controller.getPassiveUseCase = {
      execute: async () => ({ success: false, error: 'passive fail' })
    };
    const resFail = createResponseMock();
    controller.getPassive({ params: { playerId: 'p1' } }, resFail, () => {});
    await new Promise(r => setImmediate(r));

    expect(resFail.statusCode).to.equal(500);
    expect(resFail.body.success).to.equal(false);
  });
});
