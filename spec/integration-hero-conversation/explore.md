Exploración — Test de integración: diálogo con héroes

Objetivo: validar flujo completo: registro → login → listar héroes → iniciar diálogo → responder (correcto/incorrecto) → verificar puntos e impacto en player_hero_progress.

Hallazgos rápidos:
- Endpoints relevantes: POST /api/v1/player, POST /api/v1/player/login, GET /api/v1/heroes, POST /api/v1/heroes/dialog/start, POST /api/v1/heroes/dialog/answer, GET /api/v1/heroes/player/:playerId.
- Autenticación: JWT vía src/services/JwtService.js; process.env.JWT_SECRET obligatorio; middleware en index.js (express-jwt).
- DB: MySQL (Knex) — tablas claves: players, heroes, dialogs, dialog_questions, player_hero_progress, passives, player_passives.
- Lógica de puntos: src/useCases/heroes/SendAnswerUseCase.js calcula pointsAwarded y actualiza player_hero_progress.
- Tests y plantilla existentes: test/heroesPassivesApi.test.js cubre un flujo muy similar — usar como referencia.

Dependencias para el test:
- Base de datos MySQL (usar docker-compose.yml o entorno de CI con migraciones y seeds).
- Variables de entorno: JWT_SECRET, PLAYER_API_KEY, RATE_LIMIT_MAX_LOGIN (elevar para tests), credenciales DB.

Siguientes pasos recomendados: generar proposal.md, spec.md, tasks.md en esta carpeta y un test de integración basado en test/heroesPassivesApi.test.js.
