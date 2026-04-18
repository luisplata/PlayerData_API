# Design: Heroes Passives Backend

## Technical Approach
Implementar la funcionalidad en API v1 manteniendo el patrón actual de Clean Architecture: `index.js` enruta a controllers; controllers delegan en use cases; use cases usan entities y repositories; persistencia en MySQL con Knex migrations. El diseño sigue la proposal `sdd/heroes-passives-backend/proposal` y la spec `sdd/heroes-passives-backend/spec`.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Version scope | Endpoints en `/api/v1` | Solo v2 | El backend ya expone mecánicas core en v1; menor fricción para clientes actuales. |
| Passive assignment model | `1 passive por (playerId, heroId)` | `1 passive global por player` | Evita bloqueo de progreso entre héroes y se valida con constraint único. |
| Dialog answer validation | Validación 100% server-side; nunca devolver respuestas | Validación parcial en cliente | Reduce cheat y respeta requisito de no exponer respuestas en `StartDialog`. |
| Transaction boundary | `SendAnswer` en operación atómica (validar + asignar) | Operaciones separadas | Evita estados inconsistentes y dobles asignaciones. |

## Data Flow

`CreateHero`
Client -> Route -> HeroController -> CreateHeroUseCase -> Hero entity validate -> HeroRepository -> DB

`StartDialog`
Client -> Route -> DialogController -> StartDialogUseCase -> DialogRepository -> DB -> response (sin `correctAnswer`)

`SendAnswer`
Client -> Route -> DialogController -> SendAnswerUseCase -> TransactionService
-> DialogRepository.validateAnswer
-> PlayerPassiveRepository.assignIfEligible
-> commit/rollback

`GetPassive`
Client -> Route -> PassiveController -> GetPassiveUseCase
-> PlayerPassiveRepository.getByPlayer
-> PassiveRepository.listAvailable
-> response

## File Changes

| File | Action | Description |
|---|---|---|
| `migrations/20260417000100_create_heroes_table.js` | Create | Tabla `heroes` con metadata y timestamps. |
| `migrations/20260417000101_create_passives_table.js` | Create | Tabla `passives` ligada a `heroes`. |
| `migrations/20260417000102_create_dialogs_table.js` | Create | Tabla `dialogs` por héroe. |
| `migrations/20260417000103_create_dialog_questions_table.js` | Create | Preguntas con `correct_answer` solo en DB. |
| `migrations/20260417000104_create_player_passives_table.js` | Create | Asignaciones player-hero-passive con unique compuesto. |
| `migrations/20260417000105_add_heroes_indexes_safe.js` | Create | Índices en FKs y búsquedas frecuentes (`heroId`, `playerId`). |
| `src/entities/Hero.js` | Create | Invariantes de héroe y metadata. |
| `src/entities/Passive.js` | Create | Invariantes de pasiva. |
| `src/entities/Dialog.js` | Create | Invariantes de diálogo. |
| `src/repositories/HeroRepository.js` | Create | CRUD hero/listado. |
| `src/repositories/PassiveRepository.js` | Create | Catálogo y lookups de pasivas. |
| `src/repositories/DialogRepository.js` | Create | StartDialog + validación de respuesta. |
| `src/repositories/PlayerPassiveRepository.js` | Create | Consulta/asignación de pasivas de jugador. |
| `src/useCases/heroes/CreateHeroUseCase.js` | Create | Regla de creación de héroe. |
| `src/useCases/heroes/GetHeroListUseCase.js` | Create | Listado de héroes con metadata. |
| `src/useCases/heroes/StartDialogUseCase.js` | Create | Entrega preguntas filtradas sin respuestas. |
| `src/useCases/heroes/SendAnswerUseCase.js` | Create | Valida y asigna pasiva atómicamente. |
| `src/useCases/heroes/GetPassiveUseCase.js` | Create | Estado del jugador + catálogo. |
| `src/controllers/HeroController.js` | Create | Endpoints CreateHero/GetHeroList. |
| `src/controllers/DialogController.js` | Create | Endpoints StartDialog/SendAnswer. |
| `src/controllers/PassiveController.js` | Create | Endpoint GetPassive. |
| `src/config/DependencyContainer.js` | Modify | Registrar nuevos repositories y controllers. |
| `src/middlewares/ValidationMiddleware.js` | Modify | Agregar validadores de hero/dialog/answer payload. |
| `index.js` | Modify | Montar rutas v1 de héroes/pasivas y protección auth. |
| `test/heroesPassivesApi.test.js` | Create | Integración endpoints nuevos. |
| `test/useCases/heroes/*.test.js` | Create | Unit tests de reglas de negocio. |

## Interfaces / Contracts

```javascript
// POST /api/v1/heroes
// body: { heroId, name, metadata }

// GET /api/v1/heroes
// response: { heroes: [{ heroId, name, metadata }] }

// POST /api/v1/heroes/dialog/start
// body: { playerId, heroId }
// response: { dialogId, questions: [{ questionId, prompt, options }] }

// POST /api/v1/heroes/dialog/answer
// body: { playerId, heroId, questionId, answer }
// response: { correct, assignedPassive }

// GET /api/v1/heroes/passive/:playerId
// response: { assigned: [...], available: [...] }
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Entities + use cases de héroes/pasivas | TDD: tests first por caso feliz y borde, luego implementación. |
| Integration | Controllers + repos + DB para 5 endpoints | `chai-http` contra app real con fixtures mínimas y limpieza por test. |
| Migration | Up/down + constraints + índices | Tests de schema en entorno aislado verificando unique/FK. |

Policy: en funcionalidades nuevas no se considera terminado sin cobertura >= 90% (líneas y ramas del módulo de héroes/pasivas).

## Migration / Rollout
Migración requerida. Plan:
1. Crear tablas e índices en migraciones nuevas (sin tocar tablas legacy).
2. Aplicar en staging y validar constraints.
3. Desplegar endpoints behind route registration en v1.
4. Rollback: revertir rutas en `index.js`; si hay rollback de schema usar `down` en orden inverso.

## Open Questions
- [ ] Confirmar si `GetPassive` devuelve una sola pasiva activa o lista por héroe.
- [ ] Definir política de reintentos/cooldown en `SendAnswer` (por ejemplo, 3 intentos por diálogo).
- [ ] Confirmar si `CreateHero` requiere API key administrativa dedicada.
