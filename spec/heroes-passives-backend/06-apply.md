# Apply - heroes-passives-backend

## Status
In progress.

## Execution Notes
Este documento registra implementacion por lotes:
- Cambios por archivo
- Resultado de pruebas
- Riesgos detectados en ejecucion

## Batch: Phase 5 (Integration, Migration Integrity, Coverage)

### Files Added
- `test/heroesPassivesApi.test.js`
- `test/migrations/heroesMigrationIntegrity.test.js`
- `test/entities/heroesEntityValidation.test.js`
- `test/repositories/heroesRepositoriesCoverage.test.js`
- `test/controllers/heroesControllers.test.js`

### Files Updated
- `spec/heroes-passives-backend/05-tasks.md`

### Test Evidence
1. `npm test -- test/heroesPassivesApi.test.js test/migrations/heroesMigrationIntegrity.test.js`
	- Result: `4 passing`
	- Validates endpoint flow for CreateHero/GetHeroList/StartDialog/SendAnswer/GetPassive and migration integrity constraints/down behavior.

2. `npm test -- test/entities/heroEntity.test.js test/entities/heroesEntityValidation.test.js test/repositories/heroRepository.test.js test/repositories/heroesRepositoriesCoverage.test.js test/controllers/heroesControllers.test.js test/useCases/heroes/*.test.js test/heroesPassivesApi.test.js test/migrations/heroesMigrationIntegrity.test.js`
	- Result: `36 passing`
	- Validates full heroes/passives test pack used for coverage gate.

3. `npx nyc --reporter=text-summary --reporter=text --reporter=json-summary --include "src/entities/Hero.js" --include "src/entities/Passive.js" --include "src/entities/Dialog.js" --include "src/repositories/HeroRepository.js" --include "src/repositories/PassiveRepository.js" --include "src/repositories/DialogRepository.js" --include "src/repositories/PlayerPassiveRepository.js" --include "src/useCases/heroes/*.js" --include "src/controllers/HeroController.js" --include "src/controllers/DialogController.js" --include "src/controllers/PassiveController.js" mocha --exit test/entities/heroEntity.test.js test/entities/heroesEntityValidation.test.js test/repositories/heroRepository.test.js test/repositories/heroesRepositoriesCoverage.test.js test/controllers/heroesControllers.test.js test/useCases/heroes/*.test.js test/heroesPassivesApi.test.js test/migrations/heroesMigrationIntegrity.test.js`
	- Coverage summary:
	  - Statements: `96.8%`
	  - Branches: `91.45%`
	  - Functions: `100%`
	  - Lines: `96.78%`

### Risks Found During Apply
- Integration tests create data in shared DB (players/heroes/passives/dialogs) and do not auto-clean rows; this can grow test data over time.
- Coverage command is focused on heroes/passives modules and is not a whole-repo gate.
