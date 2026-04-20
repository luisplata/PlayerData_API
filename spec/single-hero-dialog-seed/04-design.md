# Design - single-hero-dialog-seed

## Contract Base
El nodo minimo del dialogo queda definido por estos campos:
`sequence`, `emotion`, `nextSequence`, `isQuestion`, `possibleAnswers`.

Este es el contrato base que debe respetar el seed, la migracion de datos y cualquier futura alta de dialogos.

## Technical Approach
Disenar un contrato de datos seed-first para 1 heroe existente, priorizando ejecucion reproducible, validacion de transiciones y compatibilidad futura con branching/i18n, sin introducir cambios de codigo en esta etapa.

## Canonical Flow Topology
`seq-1 -> seq-2 -> question-1 -> (seq-3 | seq-4) -> seq-5 -> seq-6 -> end`

Interpretacion funcional:
- `question-1` siempre deriva en un dialogo de respuesta (`seq-3` o `seq-4`).
- Ambas ramas reconvergen en `seq-5`.
- Desde `seq-5` se mantiene continuidad fija hasta fin.

## Content Limit
- Maximo 280 caracteres por nodo textual/pregunta.
- Este limite existe para evitar truncamiento en la UI limitada y debe mantenerse consistente entre DB, schema y validacion de contenido.
- Hoy no existe un servicio dedicado de alta de dialogos; si en el futuro se agrega uno, debe reutilizar este mismo tope.

## Conversation Result Contract
El flujo de dialogo debe devolver un resultado estructurado con al menos:
`currentSequence`, `nextSequence`, `completed`, `pointsAwarded`.

Esto permite a la UI ver el avance de la conversacion y saber cuanto puntaje se asigna al terminar.

## Scoring Rule
- `pointsAwarded` al completar la conversacion sale de `hero.metadata.pointsGainedPerConversationComplete`.
- Si el flujo no se completa, el sistema puede usar `minPointsGainedPerConversation` como referencia de progreso parcial, si aplica.
- La regla debe ser deterministica y derivarse del hero cargado.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Alcance inicial | Un solo heroe existente | Multi-heroe desde inicio | Reduce complejidad y acelera validacion E2E real. |
| Estructura de nodo | `sequence`, `emotion`, `nextSequence`, `isQuestion`, `possibleAnswers` | Modelo libre por tipo de nodo | Contrato minimo claro para seed y pruebas. |
| Branching | Hibrido: lineal por `nextSequence` + override por opcion | Solo lineal / solo grafo por opciones | Permite MVP simple y evolucion narrativa. |
| Respuestas | `possibleAnswers[]` con `optionKey`, `nextSequence`, `isCorrect?` opcional | Respuesta plana en string | Mejora trazabilidad, testing y futuras metricas. |
| i18n | Campos key-based (`textKey`, `optionTextKey`) | Texto hardcodeado unicamente | Evita deuda de localizacion y desacopla contenido. |
| Validacion | Pre-seed validator de transiciones y nodos obligatorios | Detectar errores recien en runtime | Falla temprana, menos debugging y menos datos corruptos. |
| Longitud de texto | Max 280 caracteres por nodo textual | Sin tope | Evita truncamiento visual en UI limitada. |
| Resultado de conversacion | `currentSequence`, `nextSequence`, `completed`, `pointsAwarded` | Respuesta sin estado | Permite UI progresiva y scoring final deterministico. |

## Proposed Data Shape (Seed Contract)

```json
{
  "heroId": "hero-nova",
  "dialogs": [
    {
      "sequence": "seq-1",
      "emotion": "neutral",
      "textKey": "hero.dialog.1",
      "nextSequence": "seq-2",
      "isQuestion": false,
      "possibleAnswers": []
    },
    {
      "sequence": "seq-2",
      "emotion": "confianza",
      "textKey": "hero.dialog.2",
      "nextSequence": "question-1",
      "isQuestion": false,
      "possibleAnswers": []
    },
    {
      "sequence": "question-1",
      "emotion": "sorpresa",
      "textKey": "hero.dialog.2.question",
      "nextSequence": null,
      "isQuestion": true,
      "possibleAnswers": [
        { "optionKey": "a", "optionTextKey": "hero.dialog.question1.a", "nextSequence": "seq-3", "isCorrect": true },
        { "optionKey": "b", "optionTextKey": "hero.dialog.question1.b", "nextSequence": "seq-4", "isCorrect": false }
      ]
    },
    {
      "sequence": "seq-3",
      "emotion": "confianza",
      "textKey": "hero.dialog.3.correct",
      "nextSequence": "seq-5",
      "isQuestion": false,
      "possibleAnswers": []
    },
    {
      "sequence": "seq-4",
      "emotion": "enojo",
      "textKey": "hero.dialog.4.incorrect",
      "nextSequence": "seq-5",
      "isQuestion": false,
      "possibleAnswers": []
    },
    {
      "sequence": "seq-5",
      "emotion": "neutral",
      "textKey": "hero.dialog.5",
      "nextSequence": "seq-6",
      "isQuestion": false,
      "possibleAnswers": []
    },
    {
      "sequence": "seq-6",
      "emotion": "determinacion",
      "textKey": "hero.dialog.6",
      "nextSequence": null,
      "isQuestion": false,
      "possibleAnswers": []
    }
  ]
}
```

## Referential Insertion Plan
El orden de escritura debe ser el mismo tanto en seed como en migracion:
1. Resolver `heroId` existente (`hero-nova`) y validar precondicion.
2. Insertar o actualizar el grafo de `dialogs` respetando `sequence` unica por heroe.
3. Insertar o actualizar `dialog_questions` para los nodos que sean `isQuestion = true`.
4. Validar `nextSequence`/`possibleAnswers.nextSequence` y la convergencia `seq-3`/`seq-4` -> `seq-5`.
5. Persistir la misma metadata de scoring del hero para que la UI pueda calcular el cierre.
6. Marcar el dataset como listo para E2E y para despliegue productivo.

El objetivo no es solo poblar tablas: es garantizar que seed y migracion describan exactamente el mismo flujo visible.

## Production Rollout (Migration-First)
- Comando de despliegue productivo: `npm run migrate` (o `npx knex migrate:latest`).
- No depender de `seed:run` en produccion para este flujo.
- El seed queda para desarrollo/controlado y la migracion como fuente de verdad productiva.

## Validation Rules
Las mismas reglas aplican al seed y a la migracion de datos; no puede existir divergencia entre ambos.
- `sequence` unica dentro del heroe.
- `emotion` en catalogo permitido (ej. neutral, confianza, enojo, sorpresa, determinacion).
- `textKey`/texto visible asociado al nodo no debe exceder 280 caracteres.
- Si `isQuestion = true`, `possibleAnswers.length >= 2`.
- Si `isQuestion = true`, cada opcion debe tener `nextSequence` obligatorio.
- Toda rama de opcion debe reconverger a la secuencia troncal definida (`seq-5`) en el dataset inicial.
- Toda transicion debe apuntar a `sequence` existente o terminal permitido (`null`).
- No permitir autorreferencia accidental (`nextSequence == sequence`) salvo caso explicitamente permitido.
- El resultado de la conversacion debe poder reportar avance y puntaje final sin ambiguedad.

## Tradeoffs and Better Modeling Options
1. Full graph table (`dialog_edges`) separada de nodos.
- Pros: consultas de branching mas limpias, analytics mas fuerte.
- Cons: mas joins y mayor costo inicial.

2. Embedded JSON de opciones dentro del nodo.
- Pros: seed simple y rapido.
- Cons: validacion SQL/filtro analitico mas dificil.

3. Event-sourced dialog progression.
- Pros: auditoria completa del recorrido.
- Cons: sobre-ingenieria para alcance actual.

Decision for now: contrato hibrido simple con opcion de evolucion a `dialog_edges` cuando crezca el numero de heroes y ramas.

## Risks
- Sobrecarga de validaciones puede alargar pipeline de seeds.
- Incompatibilidad de naming keys entre equipos de contenido y backend.
- Dataset incompleto puede dar falsa sensacion de cobertura.
- Inserciones parciales pueden dejar preguntas sin dialogo padre o dialogos sin convergencia.
- La migracion y el seed pueden divergir si cambian en paralelo sin checklist de paridad.
- El puntaje final puede quedar desalineado si la metadata del hero no se usa como fuente unica.

## Rollback
- Desactivar ejecucion del seed de dialogo en pipelines.
- Eliminar datos del heroe objetivo en orden inverso referencial.
- Mantener catalogo de heroes intacto para no romper consumidores actuales.
- Si ya hubo insercion parcial, revertir en orden inverso: opciones -> preguntas -> dialogs -> estado asociado del flujo.
- Si la migracion se aplico, usar rollback de migracion o una migracion inversa; no borrar a mano.
