# Design: Player Heroes Inventory

## Technical Approach
Agregar un endpoint en v1 para consultar inventario de heroes por `playerId` con estructura estable para cliente. El endpoint devuelve todo el catalogo de heroes y combina progreso por player con defaults (`level = 0`) cuando no existe historial. El calculo de scoring del dialogo queda interno y no se expone en la respuesta.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Endpoint shape | `GET /api/v1/heroes/player/:playerId` | Reusar `GET /api/v1/heroes/passive/:playerId` | Separa inventario de estado de pasiva y evita sobrecargar un contrato existente. |
| Progress storage | Nueva tabla `player_hero_progress` con `playerId`, `heroId`, `level` | Derivar nivel desde `player_passives` | El nivel debe subir por respuesta correcta aunque no haya nueva pasiva, por eso requiere estado propio. |
| Query strategy | Left join catalogo `heroes` + progreso por player | Dos queries y merge en controlador | El join garantiza una sola fuente de verdad y defaults consistentes. |
| Response privacy | Exponer solo campos client-facing (`hero`, `level`, estado basico) | Incluir scoring de dialogo | Requisito funcional: scoring y criterios de evaluacion son internos de backend/admin. |

## Data Flow

Client -> Route `/api/v1/heroes/player/:playerId` -> HeroController.getPlayerHeroes
-> GetPlayerHeroesUseCase -> HeroRepository.getAllWithPlayerProgress(playerId)
-> DB left join (`heroes` + `player_hero_progress`)
-> map defaults (`level=0` cuando null)
-> response `{ heroes: [...] }`

Respuesta de `POST /api/v1/heroes/dialog/answer` (cuando correcta)
-> SendAnswerUseCase
-> PlayerHeroProgressRepository.incrementLevel(playerId, heroId)
-> commit transaccional junto a asignacion de pasiva cuando corresponda.

## File Changes

| File | Action | Description |
|---|---|---|
| `migrations/20260419000100_create_player_hero_progress_table.js` | Create | Tabla de progreso por player-hero con `level` entero no negativo. |
| `src/repositories/PlayerHeroProgressRepository.js` | Create | Lectura e incremento de nivel por `playerId` y `heroId`. |
| `src/repositories/HeroRepository.js` | Modify | Agregar query para catalogo completo con progreso por player. |
| `src/useCases/heroes/GetPlayerHeroesUseCase.js` | Create | Caso de uso para inventario por player con defaults. |
| `src/useCases/heroes/SendAnswerUseCase.js` | Modify | Incrementar nivel en respuestas correctas dentro de transaccion. |
| `src/controllers/HeroController.js` | Modify | Nuevo handler `getPlayerHeroes`. |
| `src/config/DependencyContainer.js` | Modify | Registrar nuevo repositorio y dependencias del caso de uso. |
| `src/middlewares/ValidationMiddleware.js` | Modify | Reusar/agregar validacion para `playerId` en nueva ruta. |
| `index.js` | Modify | Registrar `GET /api/v1/heroes/player/:playerId`. |
| `test/useCases/heroes/GetPlayerHeroesUseCase.test.js` | Create | TDD de inventario con y sin progreso. |
| `test/useCases/heroes/SendAnswerUseCase.test.js` | Modify | Verificar incremento de nivel en acierto. |
| `test/heroesPassivesApi.test.js` | Modify | Integracion del endpoint de inventario y shape estable. |

## Interfaces / Contracts

```json
GET /api/v1/heroes/player/:playerId

{
  "success": true,
  "data": {
    "heroes": [
      {
        "heroId": "hero_001",
        "name": "Astra",
        "metadata": { "role": "support" },
        "level": 0
      }
    ]
  }
}
```

Notas:
- `level` es entero.
- Si no hay historial para ese hero, `level` se devuelve en `0`.
- No se exponen scoring interno ni criterios de evaluacion de respuestas.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | `GetPlayerHeroesUseCase` con defaults y con progreso | TDD RED -> GREEN -> REFACTOR con dobles de repositorio. |
| Unit | `SendAnswerUseCase` incrementa nivel en respuesta correcta | Test first para ruta correcta/incorrecta. |
| Integration | `GET /api/v1/heroes/player/:playerId` retorna todos los heroes | `chai-http` validando shape estable y `level` por hero. |
| Integration | No exposure de scoring interno en inventario | Asserts negativos sobre campos sensibles en payload. |

## Migration / Rollout
Migracion requerida.
1. Crear tabla `player_hero_progress`.
2. Deploy de codigo con nueva ruta y wiring.
3. Verificar endpoint en staging con players sin y con historial.
4. Rollback: remover ruta del router y revertir migracion en orden inverso.

## Open Questions
- [ ] Confirmar si `level` inicia en `0` o `1` para primer acierto (spec actual asume `0` inicial).
- [ ] Definir si hay tope maximo de `level` por hero.
- [ ] Confirmar si el endpoint requiere paginacion para catalogos grandes.