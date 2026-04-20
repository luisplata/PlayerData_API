const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

process.env.RATE_LIMIT_MAX_LOGIN = process.env.RATE_LIMIT_MAX_LOGIN || '1000';
process.env.RATE_LIMIT_MAX_VALIDATE = process.env.RATE_LIMIT_MAX_VALIDATE || '1000';
process.env.PLAYER_API_KEY = process.env.PLAYER_API_KEY || 'your_player_key';

const app = require('../index');

chai.use(chaiHttp);

describe('API Compatibility Example Tests', () => {
  const suffix = Date.now();
  const testPlayerId = `compat_v1_${suffix}`;
  const testNickname = `compat_nick_${suffix}`;
  const apiKey = process.env.PLAYER_API_KEY || 'your_player_key';
  let accessToken;

  describe('Current v1 Behavior', () => {
    it('should create a player in v1', (done) => {
      chai.request(app)
        .post('/api/v1/player')
        .send({
          playerId: testPlayerId,
          nickname: testNickname,
          key: apiKey
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('playerId', testPlayerId);
          done();
        });
    });

    it('should login in v1 and return token', (done) => {
      chai.request(app)
        .post('/api/v1/player/login')
        .send({ playerId: testPlayerId })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('token');
          accessToken = res.body.data.token;
          done();
        });
    });

    it('should fetch player details using JWT in v1', (done) => {
      chai.request(app)
        .get(`/api/v1/player/id/${testPlayerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('playerId', testPlayerId);
          done();
        });
    });
  });

  describe('v2 Is Intentionally Unsupported', () => {
    it('should reject v2 create player endpoint', (done) => {
      chai.request(app)
        .post('/api/v2/player')
        .send({
          playerId: `v2_try_${suffix}`,
          nickname: `v2_nick_${suffix}`,
          key: apiKey
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error.message).to.include('Unsupported API version: v2');
          done();
        });
    });

    it('should reject v2 login endpoint', (done) => {
      chai.request(app)
        .post('/api/v2/player/login')
        .send({ playerId: testPlayerId })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error.message).to.include('Unsupported API version: v2');
          done();
        });
    });
  });

  describe('Version Metadata', () => {
    it('should show v1 as current version', (done) => {
      chai.request(app)
        .get('/api/versions')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property('currentVersion', 'v1');
          expect(res.body.data.supportedVersions.supported).to.include('v1');
          expect(res.body.data.versionInfo).to.have.property('v2');
          expect(res.body.data.versionInfo.v2).to.have.property('status', 'inactive');
          done();
        });
    });
  });
});
