const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

process.env.RATE_LIMIT_MAX_LOGIN = process.env.RATE_LIMIT_MAX_LOGIN || '1000';
process.env.RATE_LIMIT_MAX_VALIDATE = process.env.RATE_LIMIT_MAX_VALIDATE || '1000';

const app = require('../index');

chai.use(chaiHttp);

describe('API Versioning Tests', () => {
  let authToken;
  let testPlayerId = 'version_test_' + Date.now();
  let testNickname = 'versionuser_' + Date.now();

  before(async () => {
    // Create a test player for versioning tests
    const createResponse = await chai.request(app)
      .post('/api/v1/player')
      .send({
        playerId: testPlayerId,
        nickname: testNickname,
        key: process.env.PLAYER_API_KEY || 'your_player_key'
      });
    
    if (createResponse.status === 201) {
      // Login to get token
      const loginResponse = await chai.request(app)
        .post('/api/v1/player/login')
        .send({ playerId: testPlayerId });
      
      if (loginResponse.status === 200) {
        authToken = loginResponse.body.data.token;
      }
    }
  });

  describe('API Version Information', () => {
    it('should return API version information', (done) => {
      chai.request(app)
        .get('/api/versions')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('supportedVersions');
          expect(res.body.data).to.have.property('versionInfo');
          expect(res.body.data).to.have.property('currentVersion', 'v1');
          expect(res.body.data).to.have.property('recommendation');
          done();
        });
    });

    it('should include v1 version info', (done) => {
      chai.request(app)
        .get('/api/versions')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.versionInfo).to.have.property('v1');
          expect(res.body.data.versionInfo.v1).to.have.property('version', '1.0.0');
          expect(res.body.data.versionInfo.v1).to.have.property('status', 'current');
          expect(res.body.data.versionInfo.v1).to.have.property('features');
          done();
        });
    });

    it('should include inactive version info for legacy and v2', (done) => {
      chai.request(app)
        .get('/api/versions')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.versionInfo).to.have.property('v2');
          expect(res.body.data.versionInfo.v2).to.have.property('status', 'inactive');
          expect(res.body.data.versionInfo).to.have.property('legacy');
          expect(res.body.data.versionInfo.legacy).to.have.property('status', 'inactive');
          expect(res.body.data.versionInfo.legacy).to.have.property('deprecationDate');
          done();
        });
    });
  });

  describe('API Version 1 Endpoints', () => {
    it('should work with v1 player login', (done) => {
      chai.request(app)
        .post('/api/v1/player/login')
        .send({ playerId: testPlayerId })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('API-Version', 'v1');
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('token');
          done();
        });
    });

    it('should work with v1 player creation', (done) => {
      const newPlayerId = 'v1_test_' + Date.now();
      const newNickname = 'v1user_' + Date.now();
      
      chai.request(app)
        .post('/api/v1/player')
        .send({
          playerId: newPlayerId,
          nickname: newNickname,
          key: process.env.PLAYER_API_KEY || 'your_player_key'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res).to.have.header('API-Version', 'v1');
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('playerId', newPlayerId);
          done();
        });
    });

    it('should work with v1 battle pass', (done) => {
      if (authToken) {
        chai.request(app)
          .get(`/api/v1/battle-pass/${testPlayerId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res).to.have.header('API-Version', 'v1');
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('battlePass');
            done();
          });
      } else {
        done();
      }
    });
  });

  describe('Legacy API Endpoints', () => {
    it('should reject legacy player login route', (done) => {
      chai.request(app)
        .post('/api/player/login')
        .send({ playerId: testPlayerId })
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error).to.have.property('message');
          expect(res.body.error.message).to.include('not found');
          done();
        });
    });

    it('should reject legacy player creation route', (done) => {
      const newPlayerId = 'legacy_test_' + Date.now();
      const newNickname = 'legacyuser_' + Date.now();
      
      chai.request(app)
        .post('/api/player')
        .send({
          playerId: newPlayerId,
          nickname: newNickname,
          key: process.env.PLAYER_API_KEY || 'your_player_key'
        })
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error).to.have.property('message');
          expect(res.body.error.message).to.include('not found');
          done();
        });
    });
  });

  describe('Unsupported API Versions', () => {
    it('should reject unsupported API versions', (done) => {
      chai.request(app)
        .post('/api/v2/player/login')
        .send({ playerId: testPlayerId })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error).to.have.property('message');
          expect(res.body.error.message).to.include('Unsupported API version');
          done();
        });
    });

    it('should provide supported versions in error response', (done) => {
      chai.request(app)
        .post('/api/v99/player/login')
        .send({ playerId: testPlayerId })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.have.property('supportedVersions');
          expect(res.body.error.supportedVersions).to.include('v1');
          expect(res.body.error.supportedVersions).to.not.include('v2');
          done();
        });
    });
  });

  describe('Response Headers', () => {
    it('should include API version headers in v1 responses', (done) => {
      chai.request(app)
        .post('/api/v1/player/login')
        .send({ playerId: testPlayerId })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('API-Version', 'v1');
          expect(res).to.have.header('API-Deprecation-Date');
          done();
        });
    });

    it('should return unsupported version error on legacy routes', (done) => {
      chai.request(app)
        .get('/api/player/validate/testnickname')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error.message).to.include('not found');
          done();
        });
    });
  });
});
