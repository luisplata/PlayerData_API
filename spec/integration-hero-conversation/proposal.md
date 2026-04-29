Propuesta — Test de integración: diálogo con héroes

Alcance:
- Verificar el flujo end-to-end: registro, login, listado de héroes, inicio de diálogo, envío de respuestas correctas e incorrectas y verificación de puntos y progreso del héroe del jugador.

Criterios de aceptación:
- El test crea un jugador y obtiene token JWT válido.
- Se puede iniciar un diálogo que no exponga la respuesta correcta en el payload.
- Al responder correctamente, la respuesta debe devolver `pointsAwarded` acorde a `hero.metadata.pointsGainedPerConversationComplete` y actualizar `player_hero_progress`.
- Al responder incorrectamente, `pointsAwarded` debe ser 0 y no debe incrementarse el `player_hero_progress`.
- El test limpia (o aísla) los datos creados para poder repetirse.

Restricciones:
- Usar la base de datos MySQL configurada por el proyecto; documentar los env vars necesarios.
