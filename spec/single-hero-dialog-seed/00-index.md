# SDD Process - single-hero-dialog-seed

## Overview
Incorporar documentacion SDD para habilitar un flujo end-to-end con seed de dialogo para un unico heroe ya existente, incluyendo preguntas y opciones de respuesta.

## Steps
1. Explore: `01-explore.md`
2. Proposal: `02-proposal.md`
3. Spec: `03-spec.md`
4. Design: `04-design.md`
5. Tasks: `05-tasks.md`
6. Apply: `06-apply.md` (pending)
7. Verify: `07-verify.md` (pending)
8. Archive: `08-archive.md` (pending)

## Current Status
- Explore: completed
- Proposal: completed
- Spec: completed
- Design: completed
- Tasks: completed
- Apply: pending
- Verify: pending
- Archive: pending

## Change Summary
- Cubrir el gap actual de datos para dialogo/preguntas/respuestas de un heroe existente.
- Definir modelo de dialogo con secuencia, emocion, siguiente secuencia, indicador de pregunta y respuestas posibles.
- Contrato base visible: `sequence`, `emotion`, `nextSequence`, `isQuestion`, `possibleAnswers`.
- Limitar el texto visible de cada nodo/pregunta a 280 caracteres para la UI limitada.
- Establecer el mismo grafo en seed y migracion, con el flujo visible en cada respuesta.
- Definir el puntaje final del player al completar la conversacion con el heroe.
- Formalizar criterios de aceptacion y casos de prueba E2E para validar avance y cierre de conversacion.
- Documentar riesgos y plan de rollback para datos productivos (migracion de datos).
