const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const app = require('../index');

chai.use(chaiHttp);

describe('Clean Architecture API Tests', () => {
  let authToken;
  let testPlayerId = 'test_player_' + Date.now();
  let testNickname = 'testuser_' + Date.now();

  describe('Health Check', () => {
    it('should return health status', (done) => {
      chai.request(app)
        .get('/health')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'API is healthy');
          expect(res.body).to.have.property('version', '1.0.0');
          done();
        });
    });
  });

  describe('Player Management', () => {
    it('should create a new player with valid data', (done) => {
      chai.request(app)
        .post('/api/player')
        .send({
          playerId: testPlayerId,
          nickname: testNickname,
          key: process.env.PLAYER_API_KEY || 'your_player_key'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Player created successfully');
          expect(res.body.data).to.have.property('playerId', testPlayerId);
          expect(res.body.data).to.have.property('nickname', testNickname);
          done();
        });
    });

    it('should reject player creation with invalid data', (done) => {
      chai.request(app)
        .post('/api/player')
        .send({
          playerId: 'ab', // Too short
          nickname: 'x', // Too short
          key: 'invalid_key'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error).to.have.property('statusCode', 400);
          done();
        });
    });

    it('should login with valid player ID', (done) => {
      chai.request(app)
        .post('/api/player/login')
        .send({ playerId: testPlayerId })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('token');
          expect(res.body.data).to.have.property('player');
          authToken = res.body.data.token;
          done();
        });
    });

    it('should reject login with invalid player ID', (done) => {
      chai.request(app)
        .post('/api/player/login')
        .send({ playerId: 'nonexistent_player' })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error).to.have.property('statusCode', 401);
          done();
        });
    });

    it('should validate nickname availability', (done) => {
      chai.request(app)
        .get(`/api/player/validate/${testNickname}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('available', false);
          done();
        });
    });

    it('should get player by ID with valid token', (done) => {
      chai.request(app)
        .get(`/api/player/id/${testPlayerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('playerId', testPlayerId);
          done();
        });
    });

    it('should reject request without valid token', (done) => {
      chai.request(app)
        .get(`/api/player/id/${testPlayerId}`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          done();
        });
    });
  });

  describe('Battle Pass Management', () => {
    it('should get battle pass for player', (done) => {
      chai.request(app)
        .get(`/api/battle-pass/${testPlayerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('battlePass');
          expect(res.body.data).to.have.property('rewards');
          done();
        });
    });

    it('should add experience to battle pass', (done) => {
      chai.request(app)
        .post('/api/battle-pass/experience')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          playerId: testPlayerId,
          experience: 50
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('level');
          expect(res.body.data).to.have.property('experience');
          done();
        });
    });

    it('should reject invalid experience values', (done) => {
      chai.request(app)
        .post('/api/battle-pass/experience')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          playerId: testPlayerId,
          experience: -10
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error).to.have.property('statusCode', 400);
          done();
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', (done) => {
      chai.request(app)
        .get('/api/nonexistent')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error).to.have.property('statusCode', 404);
          done();
        });
    });

    it('should handle validation errors consistently', (done) => {
      chai.request(app)
        .post('/api/player/login')
        .send({ playerId: '' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body.error).to.have.property('statusCode', 400);
          expect(res.body.error).to.have.property('message');
          done();
        });
    });
  });
});
