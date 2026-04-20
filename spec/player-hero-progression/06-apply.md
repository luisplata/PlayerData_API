# Apply - player-hero-progression

## Scope Implemented
Se implementaron los cambios de progresion por heroe usando `heroes.metadata` y seed dedicado.

## Tasks Applied
- 1.1 RED tests en entidad Hero para campos de progresion.
- 1.2 GREEN validaciones de dominio para 4 campos y regla `complete >= min`.
- 1.3 REFACTOR helper de validacion en entidad Hero.
- 2.1 RED tests de metadata de progresion en `GetPlayerHeroesUseCase`.
- 2.2 GREEN compatibilidad del use case (sin romper contrato existente).
- 2.3 REFACTOR defaults para metadata parcial de progresion en respuesta.
- 3.1 Seed `seed_heroes.js` con 1 heroe de ejemplo.
- 3.2 Seed idempotente por `heroId`.
- 3.3 Verificacion con `npm run clean:migrate`.
- 4.1 Tests focalizados ejecutados y passing.

## Files Changed
- `src/entities/Hero.js`
- `src/useCases/heroes/GetPlayerHeroesUseCase.js`
- `test/entities/heroEntity.test.js`
- `test/useCases/heroes/GetPlayerHeroesUseCase.test.js`
- `seeds/seed_heroes.js`

## Evidence
### RED evidence
`npm test -- test/useCases/heroes/GetPlayerHeroesUseCase.test.js`
- Resultado previo: 1 failing (defaults de metadata parcial no aplicados).

### GREEN evidence
`npm test -- test/useCases/heroes/GetPlayerHeroesUseCase.test.js test/entities/heroEntity.test.js`
- Resultado: 12 passing, 0 failing.

### Migration + seed evidence
`npm run clean:migrate`
- Resultado: migraciones OK, seeds OK (2 seed files ejecutados).

## Notes
- Se mantuvo persistencia en JSON por compatibilidad y bajo riesgo en MySQL 5.7.
- Se agrego normalizacion de defaults solo cuando existe metadata de progresion parcial, para no alterar heroes legacy sin estos campos.
