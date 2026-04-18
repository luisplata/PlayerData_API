# Design: Backend Security Hardening

## Technical Approach
Aplicar hardening incremental en el pipeline actual de Express: validar secretos antes de arrancar, encapsular protecciones HTTP en middleware dedicado y proteger rutas sensibles con `authenticate`, manteniendo compatibilidad con clientes Unity nativos y controlando acceso Web por CORS de origen.

## Architecture Decisions

| Decision | Options | Decision | Rationale |
|---|---|---|---|
| JWT secret policy | Fallback default vs fail-fast | Fail-fast sin fallback | Evita que una mala configuracion habilite tokens falsificables |
| CORS strategy | Whitelist por IP vs por Origin | Whitelist por Origin + permitir no-Origin | CORS es browser-based; Unity nativo no depende de CORS igual que WebGL |
| Abuse protection scope | Rate limit global vs endpoints sensibles | Endpoints sensibles primero | Menor riesgo de regresion y mejor impacto inicial |
| Docs exposure | Public docs vs auth-protected docs | Proteger `/api-docs` | Reduce fingerprinting y abuso de reconocimiento |

## Data Flow

Request -> SecurityMiddleware (helmet + CORS + rate-limit)
       -> Auth middleware (when route requires)
       -> Validation middleware
       -> Controller -> UseCase -> Repository -> DB

Boot -> Env validation (`JWT_SECRET`, runtime mode)
     -> Start server only if security preconditions are valid

## File Changes

| File | Action | Description |
|---|---|---|
| `index.js` | Modify | Eliminar fallback JWT, validar env, ordenar middleware de seguridad, proteger rutas sensibles |
| `src/services/JwtService.js` | Modify | Quitar fallback y usar secreto obligatorio |
| `src/middlewares/SecurityMiddleware.js` | Create | Config centralizada de CORS, rate limit y helmet |
| `docker-compose.yml` | Modify | Asegurar `NODE_ENV=production` y defaults seguros |
| `env.example` | Modify | Variables obligatorias y ejemplo de `CORS_ALLOWED_ORIGINS` |
| `test/playerApi.test.js` | Modify | Casos de auth/rate limit sobre player endpoints |
| `test/middlewares/securityMiddleware.test.js` | Create | Pruebas de CORS por origin y requests sin origin |

## Interfaces / Contracts

```javascript
// Security env
JWT_SECRET=<required>
CORS_ALLOWED_ORIGINS=https://game.example.com,https://staging.example.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_LOGIN=5

// CORS behavior
// - If Origin header exists: must match allowlist
// - If Origin header is missing: allow (native clients), continue with auth controls
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Env validation + CORS decision rules | TDD RED-GREEN-REFACTOR |
| Integration | Auth on protected routes, 429 behavior | HTTP tests against app instance |
| Regression | Existing player flows with valid token | Existing suite + new security scenarios |

## Migration / Rollout
No migration de DB requerida.

Rollout:
1. Deploy con variables nuevas configuradas.
2. Activar protección de rutas sensibles.
3. Monitorear 401/429 y ajustar límites.
4. Comunicar consumidores si había dependencia de endpoint público.

## Open Questions
- [ ] Definir si `/api-docs` quedará accesible por token de usuario o por API key interna.
- [ ] Confirmar límites iniciales de rate-limit por endpoint en producción.
