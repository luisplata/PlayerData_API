# Tasks: Heroes Passives Backend

## Phase 1: Foundation / Database

- [ ] 1.1 Create `migrations/20260417000100_create_heroes_table.js` with `heroId` unique, metadata JSON, timestamps.
- [ ] 1.2 Create `migrations/20260417000101_create_passives_table.js` with FK to `heroes(heroId)` and passive metadata.
- [ ] 1.3 Create `migrations/20260417000102_create_dialogs_table.js` with FK to `heroes(heroId)`.
- [ ] 1.4 Create `migrations/20260417000103_create_dialog_questions_table.js` with FK to dialogs and stored `correct_answer`.
- [ ] 1.5 Create `migrations/20260417000104_create_player_passives_table.js` with FK to player/passive/hero and unique `(playerId, heroId, passiveId)`.
- [ ] 1.6 Create `migrations/20260417000105_add_heroes_indexes_safe.js` for `heroId`, `playerId`, and dialog lookup indexes.

## Phase 2: Domain and Data Access

- [ ] 2.1 Create `src/entities/Hero.js`, `src/entities/Passive.js`, `src/entities/Dialog.js` with validation invariants.
- [ ] 2.2 Create `src/repositories/HeroRepository.js` and `src/repositories/PassiveRepository.js` for create/list/find methods.
- [ ] 2.3 Create `src/repositories/DialogRepository.js` with `startDialog` data retrieval and server-side answer validation.
- [ ] 2.4 Create `src/repositories/PlayerPassiveRepository.js` with idempotent assignment and player passive queries.

## Phase 3: TDD Core Use Cases (RED -> GREEN -> REFACTOR)

- [ ] 3.1 RED: create failing tests in `test/useCases/heroes/CreateHeroUseCase.test.js` for success and invalid metadata.
- [ ] 3.2 GREEN: implement `src/useCases/heroes/CreateHeroUseCase.js` to satisfy 3.1; REFACTOR shared validation.
- [ ] 3.3 RED: create failing tests in `test/useCases/heroes/GetHeroListUseCase.test.js` including empty list edge case.
- [ ] 3.4 GREEN: implement `src/useCases/heroes/GetHeroListUseCase.js`; REFACTOR repository mapping.
- [ ] 3.5 RED: create failing tests in `test/useCases/heroes/StartDialogUseCase.test.js` asserting no answers in response.
- [ ] 3.6 GREEN: implement `src/useCases/heroes/StartDialogUseCase.js`; REFACTOR DTO filter to remove `correctAnswer`.
- [ ] 3.7 RED: create failing tests in `test/useCases/heroes/SendAnswerUseCase.test.js` for correct, incorrect, duplicate assignment.
- [ ] 3.8 GREEN: implement `src/useCases/heroes/SendAnswerUseCase.js` using `TransactionService`; REFACTOR idempotency checks.
- [ ] 3.9 RED: create failing tests in `test/useCases/heroes/GetPassiveUseCase.test.js` for player with/without passive.
- [ ] 3.10 GREEN: implement `src/useCases/heroes/GetPassiveUseCase.js`; REFACTOR response shape consistency.

## Phase 4: Integration / Wiring

- [ ] 4.1 Create `src/controllers/HeroController.js`, `src/controllers/DialogController.js`, `src/controllers/PassiveController.js`.
- [ ] 4.2 Modify `src/middlewares/ValidationMiddleware.js` adding validators for hero/dialog/answer payloads.
- [ ] 4.3 Modify `src/config/DependencyContainer.js` to register new repositories/use-case dependencies/controllers.
- [ ] 4.4 Modify `index.js` to add `/api/v1/heroes`, `/api/v1/heroes/dialog/start`, `/api/v1/heroes/dialog/answer`, `/api/v1/heroes/passive/:playerId`.

## Phase 5: Integration Tests, Coverage and Docs

- [ ] 5.1 Create `test/heroesPassivesApi.test.js` covering spec scenarios: CreateHero, GetHeroList, StartDialog, SendAnswer, GetPassive.
- [ ] 5.2 Add migration integrity tests for FK, unique constraints, and rollback paths (up/down).
- [ ] 5.3 Enforce and verify >=90% coverage for new heroes/passives modules; block completion if below threshold.
- [ ] 5.4 Update `spec/heroes-passives-backend/06-apply.md` with implementation evidence per batch.
- [ ] 5.5 Update `spec/heroes-passives-backend/07-verify.md` with scenario pass/fail matrix and risk notes.
