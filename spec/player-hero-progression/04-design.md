# Design: player-hero-progression

## Technical Approach
Implementar la configuracion de progresion dentro de `heroes.metadata`, validando los nuevos campos en la entidad `Hero` y creando un seed inicial dedicado para heroes.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Persistencia de parametros | `heroes.metadata` | nuevas columnas SQL | Menor impacto, sin migracion adicional y consistente con atributos flexibles. |
| Validacion | Entity (`Hero`) | validar solo en controller | Las reglas de dominio quedan centralizadas y reutilizables. |
| Seed inicial | archivo nuevo `seed_heroes.js` | extender `seed_levels.js` | Separacion por dominio (niveles vs heroes) y mantenimiento mas simple. |

## Data Flow
Client/Admin -> CreateHeroUseCase -> Hero.validateMetadataAndProgression -> HeroRepository.create -> DB (`heroes.metadata`)

`GetPlayerHeroesUseCase`:
DB (`heroes` + `player_hero_progress`) -> HeroRepository.getAllWithPlayerProgress -> parseMetadata -> API response

Seed:
`knex seed:run` -> `seed_heroes.js` -> upsert/logica idempotente por `heroId`

## File Changes

| File | Action | Description |
|---|---|---|
| `src/entities/Hero.js` | Modify | Agregar validacion de campos de progresion y reglas de rango. |
| `seeds/seed_heroes.js` | Create | Insertar 1 heroe con metadata de progresion. |
| `test/entities/heroEntity.test.js` | Modify | Cobertura de validaciones para campos de progresion. |
| `test/useCases/heroes/GetPlayerHeroesUseCase.test.js` | Modify | Verificar metadata parseada con nuevos campos. |

## Interfaces / Contracts

```javascript
metadata: {
  role: string,
  xpPerLevel: number,
  pointsLostPerGame: number,
  minPointsGainedPerConversation: number,
  pointsGainedPerConversationComplete: number
}
```

Reglas propuestas:
- `xpPerLevel`: entero > 0
- `pointsLostPerGame`: entero >= 0
- `minPointsGainedPerConversation`: entero >= 0
- `pointsGainedPerConversationComplete`: entero >= 0
- `pointsGainedPerConversationComplete` >= `minPointsGainedPerConversation`

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Validacion de metadata de progresion en entidad Hero | Casos validos/invalidos con Mocha + Chai |
| Unit | Parseo y exposicion en GetPlayerHeroesUseCase | Mocks de repositorio con metadata string/object |
| Seed | Insercion de hero con metadata completa | `npm run clean:migrate` + assertions de DB |

## Migration / Rollout
No migration requerida. Solo aplicar cambios de entidad/tests y ejecutar seed.

## Open Questions
- [ ] Confirmar limites maximos de cada campo para balance inicial.
- [ ] Definir si el naming final se mantiene en camelCase o snake_case dentro de metadata.
- [ ] Confirmar si la diferencia entre intento y completo se aplica solo por heroe o tambien por tipo de dialogo.
