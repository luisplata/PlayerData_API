# Proposal - single-hero-dialog-seed

## Intent
Cerrar el gap de datos para que el mismo grafo de dialogo exista como seed y como migracion, y permita ejecutar el flujo completo de un solo heroe con progreso visible y puntaje final para el player.

## Scope
### In Scope
- Definir un contrato de seed para 1 heroe existente con nodos de dialogo, preguntas y opciones.
- Establecer reglas de modelado para secuencia, emocion, siguiente secuencia, indicador de pregunta y respuestas posibles.
- Limitar el texto de cada nodo/pregunta a 280 caracteres para compatibilidad con la UI limitada.
- Formalizar flujo canonico confirmado: `seq-1 -> seq-2 -> question-1 -> (seq-3|seq-4) -> seq-5 -> seq-6 -> end`.
- Hacer visible el avance de la conversacion con `currentSequence` y `nextSequence`.
- Definir el puntaje final del player al completar la conversacion con el heroe.
- Implementar seeds del flujo canonico para entorno dev/controlado.
- Convertir esos seeds a migracion(es) de datos trackeadas antes de `08-archive.md`.
- Definir criterios de aceptacion y casos de prueba E2E de flujo completo.
- Definir orden de insercion referencial para futuros seeders.
- Documentar riesgos, mitigaciones y rollback.

### Out of Scope
- Cambios en migraciones, tablas o endpoints.
- Expansion multi-heroe o narrativa completa de produccion.

## Approach
Generar especificacion accionable y orientada a implementacion incremental: primero seed minimo para 1 heroe, con estructura i18n-ready y validaciones de transicion para evitar dialogos rotos.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `spec/single-hero-dialog-seed/` | New | Artefactos SDD para explorar/proponer/especificar/disenar/planificar tareas |
| `seeds/` | Modified | Implementacion inicial del dataset canonico para validacion local/controlada |
| `migrations/` | Modified | Migracion de datos equivalente para produccion y trazabilidad (`knex_migrations`) |
| `test/` | Planned | Casos E2E para validar flujo completo con 1 heroe |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Seed se ejecuta antes de que exista el heroe objetivo | Medium | Verificacion previa por `heroId` y fail-fast con mensaje claro |
| Grafo de dialogo con transiciones invalidas | Medium | Validacion de secuencias existentes y deteccion de ciclos no deseados |
| Modelo no preparado para localizacion | Low | Separar claves de contenido (`textKey`) de texto literal |
| Insercion parcial deja datos inconsistentes | Medium | Ejecutar seed/migracion en orden transaccional o con rollback inverso documentado |
| Paridad seed vs migracion se desvía | Medium | Comparacion de payload y orden de escritura antes de archivar |
| Scoring final no coincide con metadata del hero | Low | Validar `pointsGainedPerConversationComplete` en el mismo cambio |

## Rollback Plan
Eliminar o desactivar los seeders de dialogo del heroe objetivo y limpiar datos insertados en orden inverso (`options/questions -> dialogs -> links auxiliares`), sin afectar hero catalog base.

Si la ejecucion quedó parcial, revertir primero las preguntas/opciones creadas, luego los nodos de dialogo, y finalmente dejar el hero intacto.

Si la migracion de datos ya fue aplicada en un entorno de prueba, revertir con `migrate:rollback` o una migracion inversa equivalente, nunca con borrado manual directo en produccion.

## Dependencies
- Heroe objetivo ya creado en entorno (precondicion): `hero-nova`.
- IDs/keys estables para mapear preguntas y opciones.

## Success Criteria
- [ ] Existe un contrato documental claro para seed de dialogo de 1 heroe basado en `hero-nova`.
- [ ] Seed y migracion contienen el mismo grafo de dialogo y la misma continuidad.
- [ ] Los seeds del flujo canonico estan implementados y verificados en entorno controlado.
- [ ] Existe migracion de datos equivalente para produccion, ejecutable por `migrate:latest`.
- [ ] El avance de la conversacion es visible en cada respuesta del flujo.
- [ ] El cierre de la conversacion produce un puntaje final determinable para el player.
- [ ] Seed y migracion siguen el mismo orden de escritura: hero -> dialogs -> dialog_questions -> validacion final.
- [ ] El texto de cada pregunta/dialogo no supera 280 caracteres y el limite esta documentado en API/DB.
- [ ] El orden de insercion referencial evita errores FK.
- [ ] Toda opcion de `question-1` tiene continuidad valida y converge a la rama troncal.
- [ ] El camino de cierre comun `seq-5 -> seq-6 -> end` es alcanzable desde cualquier respuesta.
- [ ] Hay criterios de aceptacion E2E medibles.
- [ ] Se documentan riesgos y rollback operativo.
