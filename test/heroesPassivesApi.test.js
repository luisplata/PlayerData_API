const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const db = require('../DB/db');

const { expect } = chai;
chai.use(chaiHttp);

describe('Heroes Passives API Integration', () => {
  const suffix = Date.now();
  const playerId = `hero_player_${suffix}`;
  const secondPlayerId = `hero_player_no_passive_${suffix}`;
  const heroId = `hero_${suffix}`;
  const passiveId = `passive_${suffix}`;
  const dialogIdRef = `dialog_${suffix}`;
  const questionId = `question_${suffix}`;
  const apiKey = process.env.PLAYER_API_KEY;

  let authToken;

  it('5.1 should create hero, start dialog without exposing answers, send answer, and query passive state', async () => {
    const createPlayerResponse = await chai.request(app)
      .post('/api/v1/player')
      .send({
        playerId,
        nickname: `heroNick_${suffix}`,
        key: apiKey
      });

    expect(createPlayerResponse).to.have.status(201);
    expect(createPlayerResponse.body.success).to.equal(true);

    const createSecondPlayerResponse = await chai.request(app)
      .post('/api/v1/player')
      .send({
        playerId: secondPlayerId,
        nickname: `heroNick2_${suffix}`,
        key: apiKey
      });

    expect(createSecondPlayerResponse).to.have.status(201);
    expect(createSecondPlayerResponse.body.success).to.equal(true);

    const loginResponse = await chai.request(app)
      .post('/api/v1/player/login')
      .send({ playerId });

    expect(loginResponse).to.have.status(200);
    expect(loginResponse.body.success).to.equal(true);
    expect(loginResponse.body.data).to.have.property('token');
    authToken = loginResponse.body.data.token;

    const createHeroResponse = await chai.request(app)
      .post('/api/v1/heroes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        heroId,
        name: 'Astra',
        metadata: { role: 'support' }
      });

    expect(createHeroResponse).to.have.status(201);
    expect(createHeroResponse.body.success).to.equal(true);
    expect(createHeroResponse.body.data).to.include({ heroId, name: 'Astra' });

    const heroRow = await db('heroes').where({ heroId }).first();
    expect(heroRow).to.exist;

    await db('passives').insert({
      passiveId,
      heroId,
      name: 'Solar Shield',
      metadata: JSON.stringify({ tier: 'epic' }),
      created_at: new Date(),
      updated_at: new Date()
    });

    const [dialogId] = await db('dialogs').insert({
      dialogId: dialogIdRef,
      heroId,
      title: 'Initiation',
      metadata: JSON.stringify({ chapter: 1 }),
      created_at: new Date(),
      updated_at: new Date()
    });

    await db('dialog_questions').insert({
      questionId,
      dialogId,
      question: 'What powers the shield?',
      correct_answer: 'light',
      order_index: 1,
      created_at: new Date(),
      updated_at: new Date()
    });

    const listHeroesResponse = await chai.request(app)
      .get('/api/v1/heroes')
      .set('Authorization', `Bearer ${authToken}`);

    expect(listHeroesResponse).to.have.status(200);
    expect(listHeroesResponse.body.success).to.equal(true);
    expect(listHeroesResponse.body.data.heroes.some((h) => h.heroId === heroId)).to.equal(true);

    const startDialogResponse = await chai.request(app)
      .post('/api/v1/heroes/dialog/start')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ playerId, heroId });

    expect(startDialogResponse).to.have.status(200);
    expect(startDialogResponse.body.success).to.equal(true);
    expect(startDialogResponse.body.data.questions).to.be.an('array').that.has.length(1);
    expect(startDialogResponse.body.data.questions[0]).to.not.have.property('correct_answer');

    const sendAnswerResponse = await chai.request(app)
      .post('/api/v1/heroes/dialog/answer')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        playerId,
        heroId,
        questionId,
        answer: 'light'
      });

    expect(sendAnswerResponse).to.have.status(200);
    expect(sendAnswerResponse.body.success).to.equal(true);
    expect(sendAnswerResponse.body.data.correct).to.equal(true);
    expect(sendAnswerResponse.body.data.assignedPassive).to.have.property('passiveId', passiveId);

    const sendDuplicateAnswerResponse = await chai.request(app)
      .post('/api/v1/heroes/dialog/answer')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        playerId,
        heroId,
        questionId,
        answer: 'light'
      });

    expect(sendDuplicateAnswerResponse).to.have.status(200);
    expect(sendDuplicateAnswerResponse.body.success).to.equal(true);
    expect(sendDuplicateAnswerResponse.body.data.correct).to.equal(true);
    expect(sendDuplicateAnswerResponse.body.data.assignedPassive).to.have.property('passiveId', passiveId);

    const getPassiveResponse = await chai.request(app)
      .get(`/api/v1/heroes/passive/${playerId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(getPassiveResponse).to.have.status(200);
    expect(getPassiveResponse.body.success).to.equal(true);
    expect(getPassiveResponse.body.data.assignedPassive).to.have.property('passiveId', passiveId);
    expect(getPassiveResponse.body.data.catalog).to.be.an('array').that.is.not.empty;

    const getPassiveNoAssignedResponse = await chai.request(app)
      .get(`/api/v1/heroes/passive/${secondPlayerId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(getPassiveNoAssignedResponse).to.have.status(200);
    expect(getPassiveNoAssignedResponse.body.success).to.equal(true);
    expect(getPassiveNoAssignedResponse.body.data.assignedPassive).to.equal(null);
    expect(getPassiveNoAssignedResponse.body.data.catalog).to.be.an('array');
  });
});
