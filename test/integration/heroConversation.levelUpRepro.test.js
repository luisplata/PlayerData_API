const chai = require('chai');
const chaiHttp = require('chai-http');

process.env.PLAYER_API_KEY = process.env.PLAYER_API_KEY || 'your_player_key';

const app = require('../../index');
const db = require('../../DB/db');
const { createAndLogin } = require('../helpers/createTestPlayer');
const { deletePlayerData } = require('../helpers/dbClean');

const { expect } = chai;
chai.use(chaiHttp);

const request = () => chai.request(app);

describe('Integration — Hero conversation level-up repro', () => {
  const suffix = Date.now();
  const playerId = `repro_player_${suffix}`;
  const heroId = `repro_hero_${suffix}`;
  const dialogIdRef = `repro_dialog_${suffix}`;
  const questionId = `repro_question_${suffix}`;

  let authToken;

  after(async () => {
    await deletePlayerData(db, { playerId, heroId, dialogId: dialogIdRef, questionId });
  });

  it('reproduces level-up when currentXp reaches threshold (95 + 10 => level+1, currentXp 5)', async () => {
    authToken = await createAndLogin(app, playerId);
    expect(authToken).to.be.a('string');

    // create hero with xpPerLevel 100 and points 10
    const createHeroResponse = await request()
      .post('/api/v1/heroes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        heroId,
        name: 'ReproHero',
        metadata: { role: 'support', xpPerLevel: 100, pointsGainedPerConversationComplete: 10 }
      });

    expect(createHeroResponse).to.have.status(201);

    // Insert dialog and question
    const [dialogId] = await db('dialogs').insert({ dialogId: dialogIdRef, heroId, title: 'ReproDialog', metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date() });
    await db('dialog_questions').insert({ questionId, dialogId, node_sequence: 'seq-1', question: 'Q?', correct_answer: 'a', order_index: 1, created_at: new Date(), updated_at: new Date() });

    // Insert player hero progress near threshold
    await db('player_hero_progress').insert({ playerId, heroId, level: 0, currentXp: 95, created_at: new Date(), updated_at: new Date() });

    // Send correct answer
    const sendAnswerResponse = await request()
      .post('/api/v1/heroes/dialog/answer')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ playerId, heroId, questionId, answer: 'a' });

    expect(sendAnswerResponse).to.have.status(200);
    expect(sendAnswerResponse.body.success).to.equal(true);
    expect(sendAnswerResponse.body.data.correct).to.equal(true);

    // Check DB progress
    const progressRow = await db('player_hero_progress').where({ playerId, heroId }).first();
    expect(progressRow).to.exist;
    const expectedTotalXp = 95 + (sendAnswerResponse.body.data.pointsAwarded || 0);
    const xpPerLevel = 100;
    const expectedLevel = Math.floor(expectedTotalXp / xpPerLevel);
    const expectedCurrentXp = expectedTotalXp % xpPerLevel;

    expect(progressRow.level).to.equal(expectedLevel);
    expect(progressRow.currentXp).to.equal(expectedCurrentXp);
  }).timeout(20000);
});
