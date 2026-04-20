# Proposal: Player Heroes Inventory

## Intent
Permitir que el juego consulte, dado un `playerId`, todos los heroes disponibles y su estado de progreso, incluyendo el nivel, sin romper la estructura cuando no existe conversacion previa.

## Scope

### In Scope
- Nuevo endpoint de consulta de heroes por player.
- Respuesta con todos los heroes del catalogo.
- Inclusión de un nivel entero por hero.
- Valores por defecto para heroes sin progreso.
- Incremento del nivel cuando `/api/v1/heroes/dialog/answer` se resuelva correctamente.

### Out of Scope
- UI del cliente.
- Cambios en el catalogo base de heroes.
- Reglas de gameplay distintas al progreso del dialogo.
- Exponer scoring interno o criterios de evaluacion de respuestas del dialogo.

## Approach
Usar una consulta que combine el catalogo de heroes con el estado del player. Los heroes sin conversacion previa deben seguir apareciendo con nivel inicial `0` y con la misma forma de respuesta que los heroes con progreso. Los heroes con progreso deben devolver su nivel actual.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `Router/` | Modified | Nueva ruta de inventario por player. |
| `Controller/` o `src/controllers/` | Modified | Nuevo handler para listar heroes por player. |
| `Model/` o `src/entities/` | Modified | Representacion del progreso player-heroe. |
| `DB/` y `migrations/` | Modified | Persistencia del nivel por hero y player. |
| `spec/player-heroes-inventory/` | New | Documentacion SDD del cambio. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Definicion ambigua de nivel | Med | Fijar nivel como entero incremental por acierto. |
| Respuesta inconsistente entre hero catalog y progreso | Med | Consulta unica o ensamblado deterministico. |
| Confusion entre pasiva y progreso | Alta | Separar el concepto de inventario/progreso del de pasiva asignada. |

## Rollback Plan
Deshabilitar la nueva ruta y revertir los cambios de persistencia sin tocar el catalogo ni el flujo actual de dialogo.

## Dependencies
- `playerId` valido para realizar la consulta.
- Flujo existente de `/api/v1/heroes/dialog/answer` para incrementar el progreso.

## Success Criteria
- [ ] La consulta devuelve todos los heroes del catalogo para un `playerId` dado.
- [ ] Los heroes sin conversacion aparecen con nivel `0`.
- [ ] Los heroes sin conversacion conservan la misma estructura de respuesta que los heroes con progreso.
- [ ] Los heroes con progreso exponen un nivel entero consistente.
- [ ] Un acierto en `/api/v1/heroes/dialog/answer` incrementa el nivel asociado.