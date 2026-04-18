const chai = require('chai');
const chaiHttp = require('chai-http');
const express = require('express');
const cors = require('cors');

const { expect } = chai;
chai.use(chaiHttp);

describe('Security HTTP hardening', () => {
  function createTestApp(overrides = {}) {
    const SecurityMiddleware = require('../../src/middlewares/SecurityMiddleware');
    const app = express();
    app.use(express.json());

    const env = {
      CORS_ALLOWED_ORIGINS: 'https://game.example.com,https://staging.example.com',
      RATE_LIMIT_WINDOW_MS: '60000',
      RATE_LIMIT_MAX_LOGIN: '2',
      RATE_LIMIT_MAX_VALIDATE: '2',
      ...overrides
    };

    app.use(SecurityMiddleware.securityHeaders());
    app.use(cors(SecurityMiddleware.getCorsOptions(env)));

    const { loginLimiter, validateLimiter } = SecurityMiddleware.createSensitiveRateLimiters(env);

    app.post('/api/v1/player/login', loginLimiter, (req, res) => {
      res.status(200).json({ success: true });
    });

    app.get('/api/v1/player/validate/:nickname', validateLimiter, (req, res) => {
      res.status(200).json({ success: true, nickname: req.params.nickname });
    });

    return app;
  }

  it('should allow CORS when origin is in allowlist', async () => {
    const app = createTestApp();

    const res = await chai.request(app)
      .get('/api/v1/player/validate/test')
      .set('Origin', 'https://game.example.com');

    expect(res).to.have.status(200);
    expect(res).to.have.header('access-control-allow-origin', 'https://game.example.com');
  });

  it('should not allow CORS headers for origins outside allowlist', async () => {
    const app = createTestApp();

    const res = await chai.request(app)
      .get('/api/v1/player/validate/test')
      .set('Origin', 'https://evil.example.com');

    expect(res).to.have.status(200);
    expect(res).to.not.have.header('access-control-allow-origin');
  });

  it('should allow requests without Origin header (Unity native clients)', async () => {
    const app = createTestApp();

    const res = await chai.request(app)
      .get('/api/v1/player/validate/test-no-origin');

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('success', true);
  });

  it('should rate-limit login endpoint after configured max', async () => {
    const app = createTestApp();

    await chai.request(app).post('/api/v1/player/login').send({ playerId: 'p1' });
    await chai.request(app).post('/api/v1/player/login').send({ playerId: 'p1' });
    const res = await chai.request(app).post('/api/v1/player/login').send({ playerId: 'p1' });

    expect(res).to.have.status(429);
  });

  it('should rate-limit validate endpoint after configured max', async () => {
    const app = createTestApp();

    await chai.request(app).get('/api/v1/player/validate/nick1');
    await chai.request(app).get('/api/v1/player/validate/nick2');
    const res = await chai.request(app).get('/api/v1/player/validate/nick3');

    expect(res).to.have.status(429);
  });

  it('should include helmet security headers', async () => {
    const app = createTestApp();

    const res = await chai.request(app)
      .get('/api/v1/player/validate/headers')
      .set('Origin', 'https://game.example.com');

    expect(res).to.have.status(200);
    expect(res).to.have.header('x-content-type-options', 'nosniff');
    expect(res).to.have.header('x-dns-prefetch-control', 'off');
  });
});