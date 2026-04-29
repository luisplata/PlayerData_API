Especificación — Test: heroConversation

Secuencia de pasos (HTTP + payloads) y aserciones clave:

1) Preparación
- Ejecutar migraciones y, si es necesario, seeds mínimas para héroes/dialogs.

2) Registro (POST /api/v1/player)
- Body: { playerId, nickname, key: process.env.PLAYER_API_KEY }
- Aserciones: 201, body.success === true, jugador creado en `players`.

3) Login (POST /api/v1/player/login)
- Body: { playerId }
- Aserciones: 200, token JWT en body.data.token.

4) (Crear hero/seed) Crear hero con metadata relevante
- metadata ejemplo: { xpPerLevel: 100, pointsGainedPerConversationComplete: 10 }

5) Insertar diálogo y pregunta en BD (dialog_questions.correct_answer conocido)

6) Listar héroes (GET /api/v1/heroes) — debe contener el heroId

7) Iniciar diálogo (POST /api/v1/heroes/dialog/start)
- Aserciones: 200, preguntas devueltas, ninguna expone `correct_answer`.

8) Enviar respuesta correcta (POST /api/v1/heroes/dialog/answer)
- Body: { playerId, heroId, questionId, answer: <correct> }
- Aserciones: 200, body.data.correct === true, body.data.pointsAwarded === 10 (ej.), y `player_hero_progress` actualizado según xp logic.

9) Enviar respuesta incorrecta
- Aserciones: 200, correct === false, pointsAwarded === 0, `player_hero_progress` sin incremento.

10) Verificar inventario/progreso (GET /api/v1/heroes/player/:playerId)
- Aserciones: héroe muestra `level` y `currentXp` acorde a los puntos otorgados.

Notas técnicas:
- Asegurar `process.env.JWT_SECRET` y `PLAYER_API_KEY` en el entorno de test.
- Para evitar rate-limit: setear `RATE_LIMIT_MAX_LOGIN` y `RATE_LIMIT_MAX_VALIDATE` altos en tests.
