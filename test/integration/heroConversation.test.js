const chai = require('chai');
const chaiHttp = require('chai-http');

process.env.RATE_LIMIT_MAX_LOGIN = process.env.RATE_LIMIT_MAX_LOGIN || '1000';
process.env.RATE_LIMIT_MAX_VALIDATE =
  process.env.RATE_LIMIT_MAX_VALIDATE || '1000';
process.env.PLAYER_API_KEY = process.env.PLAYER_API_KEY || 'your_player_key';

const app = require('../../index');
const db = require('../../DB/db');
const { createAndLogin } = require('../helpers/createTestPlayer');
const { deletePlayerData } = require('../helpers/dbClean');

const { expect } = chai;
chai.use(chaiHttp);

// Support testing against a running backend (local dev).
// To force tests against an external server set `USE_RUNNING_BACKEND=true` or provide `TEST_SERVER_URL`.
const TEST_SERVER_URL = process.env.TEST_SERVER_URL || undefined;
// Only use a running backend when explicitly requested via USE_RUNNING_BACKEND
const USE_RUNNING = process.env.USE_RUNNING_BACKEND === 'true';
const request = () => (USE_RUNNING ? chai.request(TEST_SERVER_URL) : chai.request(app));

describe('Integration — Hero conversation points flow', () => {
  const suffix = Date.now();
  const playerId = `int_player_${suffix}`;
  const heroId = `int_hero_${suffix}`;
  const dialogIdRef = `int_dialog_${suffix}`;
  const questionId = `int_question_${suffix}`;

  let authToken;

  after(async () => {
    // Conditional cleanup: set SKIP_TEST_CLEANUP=true to keep test data for inspection.
    if (process.env.SKIP_TEST_CLEANUP === 'true') {
      console.log('SKIP_TEST_CLEANUP=true - leaving test data intact for inspection');
      return;
    }

    const skipConversations = process.env.SKIP_CONVERSATIONS === 'true';
    await deletePlayerData(db, {
      playerId,
      heroId,
      dialogId: dialogIdRef,
      questionId,
      skipConversations
    });
  });

  it('should register, login, start dialog, answer correct and update points', async () => {
    // create player and login via helper (supports app instance or server URL)
    authToken = await createAndLogin(USE_RUNNING ? TEST_SERVER_URL : app, playerId);
    expect(authToken).to.be.a('string');

    // create hero with metadata for points/xp
    const createHeroResponse = await request()
      .post('/api/v1/heroes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        heroId,
        name: 'TestHero',
        metadata: {
          role: 'support',
          xpPerLevel: 100,
          pointsLostPerGame: 2,
          minPointsGainedPerConversation: 1,
          pointsGainedPerConversationComplete: 10
        }
      });

    expect(createHeroResponse).to.have.status(201);
    expect(createHeroResponse.body.success).to.equal(true);

    // Insert dialog and question directly in DB
    const [dialogId] = await db('dialogs').insert({ dialogId: dialogIdRef, heroId, title: 'SpecDialog', metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date() });

    await db('dialog_questions').insert({ questionId, dialogId, node_sequence: 'test-seq-1', question: 'Test?', correct_answer: 'a', order_index: 1, created_at: new Date(), updated_at: new Date() });

    // Start dialog
    const startDialogResponse = await request()
      .post('/api/v1/heroes/dialog/start')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ playerId, heroId });

    expect(startDialogResponse).to.have.status(200);
    expect(startDialogResponse.body.success).to.equal(true);
    expect(startDialogResponse.body.data.questions).to.be.an('array');
    expect(startDialogResponse.body.data.questions[0]).to.not.have.property('correct_answer');
    // Ensure node_sequence is present and propagated from DB insert
    expect(startDialogResponse.body.data.questions[0]).to.have.property('node_sequence');
    expect(startDialogResponse.body.data.questions[0].node_sequence).to.equal('test-seq-1');
    // When dialog metadata has no nodes, node may be null
    expect(startDialogResponse.body.data.questions[0]).to.have.property('node');
    expect(startDialogResponse.body.data.questions[0].node).to.be.null;

    // Prepare a near-level-up edge case: currentXp = 95 (xpPerLevel = 100)
    await db('player_hero_progress').insert({ playerId, heroId, level: 0, currentXp: 95, created_at: new Date(), updated_at: new Date() });

    // Send correct answer
    const sendAnswerResponse = await request()
      .post('/api/v1/heroes/dialog/answer')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ playerId, heroId, questionId, answer: 'a' });

    expect(sendAnswerResponse).to.have.status(200);
    expect(sendAnswerResponse.body.success).to.equal(true);
    expect(sendAnswerResponse.body.data.correct).to.equal(true);
    expect(sendAnswerResponse.body.data).to.have.property('pointsAwarded');

    const pointsAwarded = sendAnswerResponse.body.data.pointsAwarded || 0;
    const progressRow = await db('player_hero_progress').where({ playerId, heroId }).first();
    expect(progressRow).to.exist;
    expect(progressRow.currentXp).to.be.a('number');

    // Determine xpPerLevel from hero metadata (do not assume a constant)
    const createdHero = createHeroResponse.body && createHeroResponse.body.data;
    expect(createdHero).to.exist;
    const xpPerLevel =
      (createdHero.metadata && createdHero.metadata.xpPerLevel) || 100;

    const totalXp = 95 + pointsAwarded;
    const expectedLevel = Math.floor(totalXp / xpPerLevel);
    const expectedCurrentXp = totalXp % xpPerLevel;
    expect(progressRow.level).to.equal(expectedLevel);
    expect(progressRow.currentXp).to.equal(expectedCurrentXp);

    // Verify via public player heroes endpoint that progress is reflected
    const playerHeroesRes = await request()
      .get(`/api/v1/heroes/player/${playerId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(playerHeroesRes).to.have.status(200);
    expect(playerHeroesRes.body.success).to.equal(true);
    expect(playerHeroesRes.body.data).to.have.property('heroes');
    const found = playerHeroesRes.body.data.heroes.find(h => h.heroId === heroId);
    expect(found, 'Hero should appear in player heroes list').to.exist;
    expect(found.level).to.equal(expectedLevel);
    expect(found.currentXp).to.equal(expectedCurrentXp);

    // Send incorrect answer and assert no points awarded
    const sendWrongResponse = await request()
      .post('/api/v1/heroes/dialog/answer')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ playerId, heroId, questionId, answer: 'wrong' });

    expect(sendWrongResponse).to.have.status(200);
    expect(sendWrongResponse.body.success).to.equal(true);
    expect(sendWrongResponse.body.data.correct).to.equal(false);
    expect(sendWrongResponse.body.data.pointsAwarded).to.equal(0);
  }).timeout(20000);
});
