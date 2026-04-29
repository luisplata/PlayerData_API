Tareas — Test de integración: diálogo con héroes

Checklist:
- [ ] Crear archivos `spec/*` (explore, proposal, spec, tasks) — hecho.
- [ ] Implementar test de integración en `test/integration/heroConversation.test.js` (esqueleto creado).
- [ ] Añadir helpers (crear jugador + login, limpieza de BD) si se repiten pasos.
- [ ] Incluir migraciones/seeds mínimas en setup del test o documentar comando `npm run migrate && npm run seed`.
- [ ] Ejecutar tests de integración localmente con MySQL levantado (docker-compose).
- [ ] Añadir job de CI que prepare DB, exporte `JWT_SECRET` y ejecute `npm run test:integration`.

Notas:
- Mantener los documentos en `spec/integration-hero-conversation/` para evitar mezclar con otros specs.
