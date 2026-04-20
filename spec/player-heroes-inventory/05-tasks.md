# Tasks: Player Heroes Inventory

## Phase 1: Foundation / Database

- [x] 1.1 Create `migrations/20260419000100_create_player_hero_progress_table.js` with columns `id`, `playerId`, `heroId`, `level`, timestamps, and unique `(playerId, heroId)`.
- [x] 1.2 Add FK and index coverage in the migration for `playerId` and `heroId` lookup performance.
- [x] 1.3 Add migration test coverage in `test/migrations/` for up/down and unique constraint behavior.

## Phase 2: Repositories and Use Cases (TDD)

- [x] 2.1 RED: create `test/useCases/heroes/GetPlayerHeroesUseCase.test.js` covering full catalog + default `level=0` + mixed progress.
- [x] 2.2 GREEN: create `src/useCases/heroes/GetPlayerHeroesUseCase.js` and satisfy tests from 2.1.
- [x] 2.3 REFACTOR: modify `src/repositories/HeroRepository.js` with `getAllWithPlayerProgress(playerId)` using left join and deterministic mapping.
- [x] 2.4 Create `src/repositories/PlayerHeroProgressRepository.js` with `getByPlayerAndHero` and `incrementLevel` helpers.
- [x] 2.5 RED: extend `test/useCases/heroes/SendAnswerUseCase.test.js` asserting level increments only on correct answers.
- [x] 2.6 GREEN: modify `src/useCases/heroes/SendAnswerUseCase.js` to call progress increment inside existing transaction.

## Phase 3: HTTP Wiring

- [x] 3.1 Modify `src/controllers/HeroController.js` adding `getPlayerHeroes` action and response DTO `{ heroes: [...] }`.
- [x] 3.2 Modify `src/config/DependencyContainer.js` to wire `PlayerHeroProgressRepository` and `GetPlayerHeroesUseCase` dependencies.
- [x] 3.3 Modify `index.js` to register `GET /api/v1/heroes/player/:playerId` with `authenticate` and `ValidationMiddleware.validatePlayerId`.
- [x] 3.4 Update `src/config/swagger.js` and controller annotations for the new endpoint schema.

## Phase 4: Integration and Contract Verification

- [x] 4.1 RED: extend `test/heroesPassivesApi.test.js` with inventory endpoint scenarios (no history, mixed history, all heroes returned).
- [x] 4.2 GREEN: implement minimal fixes until new integration tests pass.
- [x] 4.3 Add assertions that inventory response never exposes scoring/evaluation internals.
- [x] 4.4 Verify stable shape: every hero item includes same public fields even when no progress exists.

## Phase 5: SDD Apply/Verify Docs

- [ ] 5.1 Create `spec/player-heroes-inventory/06-apply.md` with implementation batches and evidence.
- [ ] 5.2 Create `spec/player-heroes-inventory/07-verify.md` with requirement-to-test matrix.
- [ ] 5.3 Create `spec/player-heroes-inventory/08-archive.md` once apply+verify are complete.