const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

process.env.RATE_LIMIT_MAX_LOGIN = process.env.RATE_LIMIT_MAX_LOGIN || '1000';
process.env.RATE_LIMIT_MAX_VALIDATE = process.env.RATE_LIMIT_MAX_VALIDATE || '1000';
process.env.PLAYER_API_KEY = process.env.PLAYER_API_KEY || 'your_player_key';

const app = require('../index');

chai.use(chaiHttp);

describe('Player API', () => {
  const suffix = Date.now();
  const playerId = `player_api_${suffix}`;
  const nickname = `playernick_${suffix}`;
  const apiKey = process.env.PLAYER_API_KEY || 'your_player_key';
  let authToken;

  it('should add a new player in v1', async () => {
    const res = await chai.request(app)
      .post('/api/v1/player')
      .send({ playerId, nickname, key: apiKey });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('success', true);
    expect(res.body.data).to.have.property('playerId', playerId);
    expect(res.body.data).to.have.property('nickname', nickname);
  });

  it('should login and return JWT token', async () => {
    const res = await chai.request(app)
      .post('/api/v1/player/login')
      .send({ playerId });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('success', true);
    expect(res.body.data).to.have.property('token');
    authToken = res.body.data.token;
  });

  it('should return false availability when nickname is taken', async () => {
    const res = await chai.request(app)
      .get(`/api/v1/player/validate/${nickname}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('success', true);
    expect(res.body.data).to.have.property('available', false);
  });

  it('should return true availability when nickname is free', async () => {
    const res = await chai.request(app)
      .get(`/api/v1/player/validate/free_${suffix}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('success', true);
    expect(res.body.data).to.have.property('available', true);
  });

  it('should return player ID when nickname exists', async () => {
    const res = await chai.request(app)
      .get(`/api/v1/player/${nickname}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('success', true);
    expect(res.body.data).to.have.property('playerId', playerId);
  });

  it('should return 404 when nickname does not exist', async () => {
    const res = await chai.request(app)
      .get(`/api/v1/player/unknown_${suffix}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res).to.have.status(404);
    expect(res.body).to.have.property('success', false);
  });

  it('should return player details when player ID exists', async () => {
    const res = await chai.request(app)
      .get(`/api/v1/player/id/${playerId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('success', true);
    expect(res.body.data).to.have.property('playerId', playerId);
    expect(res.body.data).to.have.property('nickname', nickname);
  });

  it('should return 404 when player ID does not exist', async () => {
    const res = await chai.request(app)
      .get('/api/v1/player/id/not_existing_player')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res).to.have.status(404);
    expect(res.body).to.have.property('success', false);
  });

  it('should update the nickname of a player', async () => {
    const newNickname = `updated_${suffix}`;
    const res = await chai.request(app)
      .put(`/api/v1/player/nickname/${playerId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ nickname: newNickname });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('success', true);
    expect(res.body).to.have.property('message', 'Nickname updated successfully');
  });

  it('should return 404 if player is not found when updating nickname', async () => {
    const res = await chai.request(app)
      .put('/api/v1/player/nickname/nonexistent_player_id')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ nickname: `new_${suffix}` });

    expect(res).to.have.status(404);
    expect(res.body).to.have.property('success', false);
  });
});

describe('Player API Security', () => {
  it('should require auth for v1 nickname validation endpoint', (done) => {
    chai.request(app)
      .get('/api/v1/player/validate/security_check_nickname')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});
