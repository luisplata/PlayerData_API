# Apply Progress - backend-security-hardening

## Batch 1 (Phase 1: tasks 1.1 - 1.5)

### Implemented
- Added security config helper in `src/config/SecurityConfig.js`.
- Enforced fail-fast JWT config in `index.js` using `validateSecurityConfig(process.env)`.
- Removed insecure JWT fallback from `index.js` express-jwt setup.
- Removed insecure JWT fallback from `src/services/JwtService.js`.
- Protected `GET /api/v1/player/validate/:nickname` with `authenticate` middleware.

### Tests (TDD)
- RED:
  - `npm test -- test/middlewares/securityMiddleware.test.js` failed (module missing).
  - `npm test -- --grep "should require auth for v1 nickname validation endpoint" test/playerApi.test.js` failed (expected 401, got 200).
- GREEN:
  - `npm test -- test/middlewares/securityMiddleware.test.js` -> 3 passing.
  - `npm test -- --grep "should require auth for v1 nickname validation endpoint" test/playerApi.test.js` -> 1 passing.

### Notes
- Scope strictly limited to tasks 1.1-1.5.
- Next batch should implement Phase 2 CORS/rate-limit/helmet controls.

## Batch 2 (Phase 2: tasks 2.1 - 2.6)

### Implemented
- Added `src/middlewares/SecurityMiddleware.js` with:
  - CORS policy by allowlist (`CORS_ALLOWED_ORIGINS`) and pass-through for requests without `Origin`.
  - Dedicated rate limiters for login and nickname validation endpoints.
  - Helmet security headers middleware wrapper.
- Integrated middleware in `index.js`:
  - `helmet` and CORS middleware now loaded in app bootstrap.
  - `loginLimiter` applied to `POST /api/v1/player/login`.
  - `validateLimiter` applied to `GET /api/v1/player/validate/:nickname`.
- Installed dependencies: `helmet`, `express-rate-limit`.

### Tests (TDD)
- RED:
  - `npm test -- test/middlewares/securityHttpHardening.test.js` -> 6 failing (missing `SecurityMiddleware`).
- GREEN:
  - `npm test -- test/middlewares/securityHttpHardening.test.js` -> 6 passing.
  - Regression checks:
    - `npm test -- test/middlewares/securityMiddleware.test.js` -> 3 passing.
    - `npm test -- --grep "should require auth for v1 nickname validation endpoint" test/playerApi.test.js` -> 1 passing.

### Notes
- CORS behavior for Unity native clients is explicit: requests without `Origin` are allowed and still protected by auth/rate-limit controls.
