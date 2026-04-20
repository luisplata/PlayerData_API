# Tasks: player-hero-progression

## Phase 1: Domain Rules (TDD)

- [ ] 1.1 RED: ampliar `test/entities/heroEntity.test.js` con casos para `xpPerLevel`, `pointsLostPerGame`, `minPointsGainedPerConversation`, `pointsGainedPerConversationComplete` validos e invalidos.
- [ ] 1.2 GREEN: modificar `src/entities/Hero.js` para validar los cuatro campos dentro de metadata y la regla `complete >= min`.
- [ ] 1.3 REFACTOR: extraer helper de validacion para mantener legibilidad en la entidad.

## Phase 2: Use Case Compatibility (TDD)

- [ ] 2.1 RED: agregar casos en `test/useCases/heroes/GetPlayerHeroesUseCase.test.js` para metadata con campos de progresion.
- [ ] 2.2 GREEN: ajustar `src/useCases/heroes/GetPlayerHeroesUseCase.js` solo si hace falta para preservar contrato parseado.
- [ ] 2.3 REFACTOR: normalizar defaults en metadata para evitar campos undefined en respuestas.

## Phase 3: Seed Bootstrap

- [ ] 3.1 Crear `seeds/seed_heroes.js` con 1 heroe de ejemplo y metadata completa de progresion.
- [ ] 3.2 Hacer el seed idempotente por `heroId` para evitar duplicados en re-ejecuciones.
- [ ] 3.3 Verificar ejecucion con `npm run clean:migrate` y validar registro en tabla `heroes`.

## Phase 4: Verification

- [ ] 4.1 Ejecutar tests focalizados de entidad y use case de heroes.
- [ ] 4.2 Documentar evidencia en `spec/player-hero-progression/06-apply.md` al implementar.
- [ ] 4.3 Completar matriz de verificacion en `spec/player-hero-progression/07-verify.md` luego del merge.
