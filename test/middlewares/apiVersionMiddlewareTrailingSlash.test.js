const { expect } = require('chai');
const ApiVersionMiddleware = require('../../src/middlewares/ApiVersionMiddleware');

describe('ApiVersionMiddleware.handleVersion', () => {
  function createResSpy() {
    return {
      statusCode: null,
      payload: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.payload = body;
        return this;
      }
    };
  }

  it('treats /api-docs/ as legacy (non-versioned) route', () => {
    const req = { path: '/api-docs/' };
    const res = createResSpy();
    let nextCalled = false;

    ApiVersionMiddleware.handleVersion(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).to.equal(true);
    expect(req.apiVersion).to.equal('legacy');
    expect(req.apiVersionNumber).to.equal(0);
    expect(res.statusCode).to.equal(null);
  });

  it('still detects /api/v1 routes as versioned', () => {
    const req = { path: '/api/v1/player/login' };
    const res = createResSpy();
    let nextCalled = false;

    ApiVersionMiddleware.handleVersion(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).to.equal(true);
    expect(req.apiVersion).to.equal('v1');
    expect(req.apiVersionNumber).to.equal(1);
    expect(res.statusCode).to.equal(null);
  });
});
