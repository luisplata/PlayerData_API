# Proposal - backend-security-hardening

## Intent
Reducir el riesgo de compromiso y abuso de API corrigiendo vulnerabilidades P0/P1 sin cambios de esquema ni reescrituras grandes.

## Scope
### In Scope
- Validación fail-fast de `JWT_SECRET` en startup.
- Eliminar cualquier fallback inseguro de secreto JWT.
- Incorporar `helmet` para headers de seguridad.
- Agregar rate limiting en login y validaciones.
- Restringir CORS por whitelist configurable.
- Exigir auth en `/player/validate/:nickname` y `/api-docs`.
- Forzar `NODE_ENV=production` en despliegue.
- Ajustar tests para validar estos controles.

### Out of Scope
- RBAC completo y permisos por rol.
- Re-arquitectura de infraestructura TLS/WAF.
- Migración a gestor externo de secretos.

## Approach
Aplicar hardening en capas: bootstrap seguro, middlewares de protección, rutas sensibles autenticadas y validación por pruebas automatizadas.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `index.js` | Modified | Bootstrap de seguridad y protección de rutas |
| `src/services/JwtService.js` | Modified | Manejo estricto de secreto JWT |
| `src/middlewares/` | Modified/New | Rate limiting y headers de seguridad |
| `docker-compose.yml` | Modified | Entorno de producción |
| `env.example` | Modified | Reglas de secretos y configuración |
| `test/` | Modified | Cobertura de controles de seguridad |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Ruptura de clientes por auth nueva | Medium | Comunicar cambio y usar versionado |
| Falsos positivos de rate limit | Medium | Configuración por entorno y monitoreo |
| Falla de arranque por secreto ausente | Low | Mensaje claro y checklist de despliegue |

## Rollback Plan
Revertir middlewares y guards de rutas; restaurar configuración previa en `index.js` y variables de entorno. No hay cambios de DB.

## Dependencies
- Paquetes: `helmet`, `express-rate-limit`.
- Coordinación con consumidores de API para rutas ahora autenticadas.

## Success Criteria
- [ ] App no inicia sin `JWT_SECRET` válido.
- [ ] Login limitado por tasa configurable.
- [ ] CORS rechaza orígenes no permitidos.
- [ ] `/player/validate/:nickname` requiere token.
- [ ] `/api-docs` no es público.
- [ ] Tests críticos de seguridad pasan.
