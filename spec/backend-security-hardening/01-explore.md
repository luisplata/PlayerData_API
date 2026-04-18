# Explore - backend-security-hardening

## Current State
El backend usa Express + JWT + MySQL y tiene buena separación en capas, pero la superficie de ataque actual es alta: fallback de secreto JWT débil, CORS abierto, falta de rate limiting y rutas sensibles sin auth.

## Main Findings
- P0: fallback de `JWT_SECRET` en bootstrap puede permitir tokens forjados si no hay secreto fuerte.
- P1: `app.use(cors())` sin restricciones de origen.
- P1: ausencia de rate limiting en login/validaciones.
- P1: endpoint de validación de nickname sin autenticación.
- P1: Swagger público sin protección.
- P1: despliegue HTTP sin reforzamiento adicional en borde.

## Affected Areas
- `index.js` - bootstrap, middlewares globales, rutas v1, swagger.
- `src/services/JwtService.js` - validación y manejo del secreto JWT.
- `src/controllers/PlayerController.js` - controles de acceso por recurso.
- `docker-compose.yml` - entorno y exposición de servicios.
- `env.example` - documentación/configuración de secretos.
- `test/playerApi.test.js` y `test/apiVersioning.test.js` - cobertura de controles de seguridad.

## Approaches
1. Quick wins inmediatos
- Pros: impacto alto en poco tiempo.
- Cons: no cubre RBAC completo.
- Effort: Low.

2. Authorization completa por recurso + roles
- Pros: reduce abuso horizontal y mejora trazabilidad.
- Cons: requiere más cambios y más pruebas.
- Effort: Medium.

## Recommendation
Ejecutar quick wins ahora (P0/P1) y planificar authorization avanzada en siguiente iteración. Esto baja riesgo ya, con mínima regresión.

## Risks
- Clientes podrían romperse si rutas públicas pasan a requerir token.
- Rate limit mal calibrado puede afectar uso legítimo.

## Ready for Proposal
Yes. El alcance y los riesgos están claros para pasar a propuesta formal.
