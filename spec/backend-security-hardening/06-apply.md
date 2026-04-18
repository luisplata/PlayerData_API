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
