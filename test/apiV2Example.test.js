const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const app = require('../index');

chai.use(chaiHttp);

describe('API Version 2 Example Tests', () => {
  let accessToken;
  let refreshToken;
  let testPlayerId = 'v2_test_' + Date.now();
  let testNickname = 'v2user_' + Date.now();
  let testEmail = 'v2user@example.com';

  describe('API V2 Player Management', () => {
    it('should create a player with enhanced profile in v2', (done) => {
      chai.request(app)
        .post('/api/v2/player')
        .send({
          playerId: testPlayerId,
          nickname: testNickname,
          email: testEmail,
          avatar: 'https://example.com/avatar.jpg',
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: true,
            privacy: 'friends'
          },
          key: process.env.PLAYER_API_KEY || 'your_player_key'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res).to.have.header('API-Version', 'v1'); // Version header from middleware
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('player');
          expect(res.body.data).to.have.property('action', 'created');
          expect(res.body.data.player).to.have.property('email', testEmail);
          expect(res.body.data.player).to.have.property('avatar', 'https://example.com/avatar.jpg');
          expect(res.body.data.player).to.have.property('preferences');
          expect(res.body.data.player.preferences).to.have.property('theme', 'dark');
          done();
        });
    });

    it('should login with enhanced authentication in v2', (done) => {
      chai.request(app)
        .post('/api/v2/player/login')
        .send({
          playerId: testPlayerId,
          email: testEmail
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('player');
          expect(res.body.data).to.have.property('authentication');
          
          // Check enhanced authentication response
          expect(res.body.data.authentication).to.have.property('accessToken');
          expect(res.body.data.authentication).to.have.property('refreshToken');
          expect(res.body.data.authentication).to.have.property('tokenType', 'Bearer');
          expect(res.body.data.authentication).to.have.property('expiresIn');
          expect(res.body.data.authentication).to.have.property('refreshExpiresIn');
          expect(res.body.data.authentication).to.have.property('sessionId');
          
          // Store tokens for further tests
          accessToken = res.body.data.authentication.accessToken;
          refreshToken = res.body.data.authentication.refreshToken;
          
          done();
        });
    });

    it('should get player profile with enhanced data in v2', (done) => {
      chai.request(app)
        .get('/api/v2/player/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('player');
          expect(res.body.data.player).to.have.property('email', testEmail);
          expect(res.body.data.player).to.have.property('avatar');
          expect(res.body.data.player).to.have.property('preferences');
          expect(res.body.data.player).to.have.property('statistics');
          
          // Check auth info in response
          expect(res.body).to.have.property('auth');
          expect(res.body.auth).to.have.property('playerId', testPlayerId);
          expect(res.body.auth).to.have.property('sessionId');
          expect(res.body.auth).to.have.property('tokenExpiresAt');
          
          done();
        });
    });

    it('should refresh access token in v2', (done) => {
      chai.request(app)
        .post('/api/v2/player/refresh')
        .send({
          refreshToken: refreshToken
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('accessToken');
          expect(res.body.data).to.have.property('tokenType', 'Bearer');
          expect(res.body.data).to.have.property('expiresIn');
          
          // New access token should be different
          expect(res.body.data.accessToken).to.not.equal(accessToken);
          
          done();
        });
    });

    it('should handle token expiration warnings', (done) => {
      chai.request(app)
        .get('/api/v2/player/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          
          // Check for token expiration warning headers
          if (res.headers['x-token-expires-soon']) {
            expect(res.headers['x-token-expires-soon']).to.equal('true');
            expect(res.headers['x-token-expires-in']).to.exist;
          }
          
          done();
        });
    });
  });

  describe('API V2 Validation', () => {
    it('should reject invalid email format in v2', (done) => {
      chai.request(app)
        .post('/api/v2/player')
        .send({
          playerId: 'test_invalid_email',
          nickname: 'testuser',
          email: 'invalid-email',
          key: process.env.PLAYER_API_KEY || 'your_player_key'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error.message).to.include('Invalid email format');
          done();
        });
    });

    it('should reject invalid avatar URL in v2', (done) => {
      chai.request(app)
        .post('/api/v2/player')
        .send({
          playerId: 'test_invalid_avatar',
          nickname: 'testuser',
          avatar: 'not-a-valid-url',
          key: process.env.PLAYER_API_KEY || 'your_player_key'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error.message).to.include('Avatar must be a valid image URL');
          done();
        });
    });

    it('should reject invalid preferences in v2', (done) => {
      chai.request(app)
        .post('/api/v2/player')
        .send({
          playerId: 'test_invalid_prefs',
          nickname: 'testuser',
          preferences: {
            invalidKey: 'invalid'
          },
          key: process.env.PLAYER_API_KEY || 'your_player_key'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error.message).to.include('Invalid preference keys');
          done();
        });
    });
  });

  describe('API Version Comparison', () => {
    it('should show v2 as current version', (done) => {
      chai.request(app)
        .get('/api/versions')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property('currentVersion', 'v2');
          expect(res.body.data.supportedVersions.supported).to.include('v2');
          expect(res.body.data.versionInfo).to.have.property('v2');
          expect(res.body.data.versionInfo.v2).to.have.property('status', 'current');
          done();
        });
    });

    it('should maintain backward compatibility with v1', (done) => {
      chai.request(app)
        .post('/api/v1/player/login')
        .send({ playerId: testPlayerId })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('token');
          done();
        });
    });
  });
});
