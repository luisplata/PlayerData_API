# Proposal - player-hero-progression

## Intent
Permitir configurar progresion de cada heroe desde backend con cuatro parametros de balance: EXP por nivel, puntos perdidos por game, puntos minimos ganados por conversacion y puntos ganados por conversacion completa.

## In Scope
- Definir y validar campos de progresion en `Hero.metadata`.
- Crear seed `seeds/seed_heroes.js` con 1 heroe incluyendo esos campos.
- Asegurar que la lectura por `GetPlayerHeroesUseCase` mantenga el contrato esperado.
- Agregar tests para validar metadata de progresion y seed.

## Out of Scope
- Nuevas columnas SQL para estos parametros.
- Reglas de gameplay en cliente.
- Ajuste de balance para multiples heroes.

## Affected Areas
- `src/entities/Hero.js`
- `src/useCases/heroes/GetPlayerHeroesUseCase.js` (confirmacion de contrato)
- `seeds/seed_heroes.js` (nuevo)
- `test/entities/heroEntity.test.js`
- `test/useCases/heroes/GetPlayerHeroesUseCase.test.js`

## Risks and Mitigations
- Riesgo: metadata invalida. Mitigacion: validacion numerica en entidad.
- Riesgo: modelo ambiguo de recompensa por conversacion. Mitigacion: separar explicitamente `minPointsGainedPerConversation` y `pointsGainedPerConversationComplete`.
- Riesgo: seed duplicado por `heroId`. Mitigacion: delete previo + insert controlado.
- Riesgo: romper consumidores actuales. Mitigacion: agregar campos nuevos sin eliminar existentes.

## Rollback
- Revertir cambios en `Hero` y tests.
- Eliminar `seeds/seed_heroes.js`.
- Ejecutar `knex seed:run --specific seed_levels.js` si se necesita repoblar solo niveles.

## Success Criteria
- Existe un heroe seed con los 4 parametros de progresion.
- Los parametros se validan en la capa de entidad.
- API devuelve metadata parseada con los campos nuevos.
- Tests cubren casos validos e invalidos.
