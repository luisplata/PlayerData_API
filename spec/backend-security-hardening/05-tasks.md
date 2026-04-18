# Tasks: Backend Security Hardening

## Phase 1: Security Foundation

- [x] 1.1 RED: crear test en `test/middlewares/securityMiddleware.test.js` para bloquear startup sin `JWT_SECRET` valido.
- [x] 1.2 GREEN: modificar `index.js` para fail-fast de `JWT_SECRET` y remover fallback por defecto.
- [x] 1.3 REFACTOR: centralizar validacion de entorno en helper reutilizable dentro de `src/config/`.
- [x] 1.4 RED: agregar test en `test/playerApi.test.js` que confirme `401` en `/api/v1/player/validate/:nickname` sin token.
- [x] 1.5 GREEN: proteger `/api/v1/player/validate/:nickname` con `authenticate` en `index.js`.

## Phase 2: HTTP Hardening

- [ ] 2.1 RED: crear tests para CORS con origin permitido, origin bloqueado y request sin origin (Unity nativo).
- [ ] 2.2 GREEN: crear `src/middlewares/SecurityMiddleware.js` con configuracion CORS basada en `CORS_ALLOWED_ORIGINS`.
- [ ] 2.3 GREEN: permitir requests sin `Origin` y exigir controles de auth normales.
- [ ] 2.4 RED: crear test de rate-limit para `/api/v1/player/login` y `/api/v1/player/validate/:nickname`.
- [ ] 2.5 GREEN: agregar `express-rate-limit` en middleware de endpoints sensibles.
- [ ] 2.6 GREEN: agregar `helmet` y verificar headers de seguridad en respuestas.

## Phase 3: Docs and Deployment Safety

- [ ] 3.1 RED: crear test para denegar `/api-docs` sin credenciales.
- [ ] 3.2 GREEN: aplicar auth guard en `/api-docs` en `index.js`.
- [ ] 3.3 GREEN: actualizar `docker-compose.yml` con `NODE_ENV=production`.
- [ ] 3.4 GREEN: actualizar `env.example` con variables requeridas (`JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, rate-limit config).

## Phase 4: Verification and Stability

- [ ] 4.1 Ejecutar tests nuevos y existentes de player/auth/security; corregir regresiones.
- [ ] 4.2 Validar que login exitoso siga funcionando con token valido.
- [ ] 4.3 Documentar evidencia en `spec/backend-security-hardening/06-apply.md` por lote implementado.
- [ ] 4.4 Completar matriz de cumplimiento en `spec/backend-security-hardening/07-verify.md` (escenarios + estado).

## Phase 5: Rollback Readiness

- [ ] 5.1 Documentar procedimiento de rollback en `06-apply.md` para middleware/rutas.
- [ ] 5.2 Verificar rollback en entorno de prueba sin tocar schema de DB.
