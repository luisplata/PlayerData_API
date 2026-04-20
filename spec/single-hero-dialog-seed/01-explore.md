# Explore - single-hero-dialog-seed

## Current State
La base ya posee entidades y tablas para heroes/dialogos, pero hoy no existe un set de datos seed consistente para ejecutar el flujo completo de un heroe con dialogo, preguntas y respuestas en entorno local o QA.

## Main Findings
- Necesidad operativa: correr todo el flujo usando un solo heroe existente para validacion rapida end-to-end.
- Falta actual: no hay seed integral de dialogos/preguntas/opciones para ese heroe.
- Impacto: pruebas de negocio y smoke tests dependen de carga manual o fixtures ad-hoc.
- Hero baseline confirmado para esta fase: `hero-nova`.

## Canonical Conversation Flow (Confirmed)
- Camino base: `seq-1 -> seq-2 -> question-1`.
- Rama por respuesta:
	- opcion 1: `question-1 -> seq-3`
	- opcion 2: `question-1 -> seq-4`
- Convergencia obligatoria:
	- `seq-3 -> seq-5`
	- `seq-4 -> seq-5`
- Cierre comun: `seq-5 -> seq-6 -> end`.
- Regla funcional: incluso con respuesta correcta o incorrecta, siempre existe dialogo de continuacion y luego retorno a la misma estructura troncal.

## Affected Areas (Documentation Scope)
- `spec/single-hero-dialog-seed/` - Nuevo cambio SDD con alcance de modelado, criterios y plan.
- `seeds/` - Referencia de destino para futuros seeders (sin cambios en esta fase documental).

## Candidate Modeling Options
1. Dialogo lineal minimo (sequence -> nextSequence)
- Pros: simple de implementar y seedear.
- Cons: poca flexibilidad para ramas futuras.
- Effort: Low.

2. Dialogo con branching por opcion
- Pros: habilita narrativa no lineal y decisiones del jugador.
- Cons: mayor validacion de transiciones y riesgo de nodos huerfanos.
- Effort: Medium.

3. Modelo hibrido (lineal por defecto + branching opcional)
- Pros: mantiene simplicidad inicial y deja evolucion natural.
- Cons: contrato de datos algo mas complejo.
- Effort: Medium.

## Recommendation
Adoptar el modelo hibrido: cada nodo de dialogo define `sequence`, `emotion`, `nextSequence`, `isQuestion` y `possibleAnswers`; cuando no hay branching explicito, `nextSequence` resuelve flujo lineal. Esta opcion habilita una primera version operativa para 1 heroe y mantiene compatibilidad con ramas futuras.

## Risks
- Inconsistencias referenciales si seeds se ejecutan fuera de orden.
- Ambiguedad entre `nextSequence` del nodo y transicion por opcion cuando ambos existen.
- Dificultad de i18n futuro si textos no se separan de identificadores estables.

## Ready for Proposal
Yes. Hay contexto suficiente para propuesta concreta con criterios de aceptacion y plan de ejecucion.
