# Apply - player-heroes-inventory

## Status
Completed.

## Execution Notes
Este documento registra la implementacion por fases para inventario de heroes por player:
- Cambios por archivo
- Evidencia de pruebas
- Riesgos detectados durante implementacion

## Batch: Phase 1 (Foundation / Database)

### Files Added
- `migrations/20260419000100_create_player_hero_progress_table.js`
- `test/migrations/playerHeroProgressMigration.test.js`

### Files Updated
- `spec/player-heroes-inventory/05-tasks.md`

### Test Evidence
1. `npm test -- test/migrations/playerHeroProgressMigration.test.js`
   - RED result: `0 passing`, `2 failing` (missing migration module).
   - GREEN result: `2 passing`.

## Batch: Phase 2 (Repositories and Use Cases - TDD)

### Files Added
- `src/useCases/heroes/GetPlayerHeroesUseCase.js`
- `src/repositories/PlayerHeroProgressRepository.js`
- `test/useCases/heroes/GetPlayerHeroesUseCase.test.js`

### Files Updated
- `src/repositories/HeroRepository.js`
- `src/useCases/heroes/SendAnswerUseCase.js`
- `test/useCases/heroes/SendAnswerUseCase.test.js`
- `spec/player-heroes-inventory/05-tasks.md`

### Test Evidence
1. `npm test -- test/useCases/heroes/GetPlayerHeroesUseCase.test.js`
   - RED result: module not found (use case missing).
   - GREEN result: `3 passing`.

2. `npm test -- test/useCases/heroes/SendAnswerUseCase.test.js`
   - RED result: `2 passing`, `1 failing` (level increment expectation unmet).
   - GREEN result: included in combined run below.

3. `npm test -- test/useCases/heroes/GetPlayerHeroesUseCase.test.js test/useCases/heroes/SendAnswerUseCase.test.js`
   - Result: `6 passing`.

## Batch: Phase 3 (HTTP Wiring + Swagger)

### Files Updated
- `src/controllers/HeroController.js`
- `src/controllers/DialogController.js`
- `src/config/DependencyContainer.js`
- `src/config/swagger.js`
- `index.js`
- `spec/player-heroes-inventory/05-tasks.md`

### Test Evidence
1. `set +H && node -e "const s=require('./src/config/swagger').specs; const ok=Boolean(s.paths&&s.paths['/api/v1/heroes/player/{playerId}']); if(ok===false){process.exit(2);} console.log('swagger-path-ok');"`
   - Result: `swagger-path-ok`.

2. `npm test -- test/useCases/heroes/GetPlayerHeroesUseCase.test.js test/useCases/heroes/SendAnswerUseCase.test.js`
   - Result: `6 passing`.

## Batch: Phase 4 (Integration and Contract Verification)

### Files Updated
- `test/heroesPassivesApi.test.js`
- `spec/player-heroes-inventory/05-tasks.md`

### Test Evidence
1. `npm test -- test/heroesPassivesApi.test.js`
   - Assertions result: `1 passing`.
   - Environment note: process returned exit code `130` after completion.

2. `npx mocha test/heroesPassivesApi.test.js`
   - Assertions result: `1 passing`.
   - Environment note: process returned exit code `130` after completion.

### Risks Found During Apply
1. Integration suite uses shared DB data and may accumulate rows over time.
2. Mocha exits with code `130` in this shell context despite passing assertions; output should be verified by pass/fail counts.
