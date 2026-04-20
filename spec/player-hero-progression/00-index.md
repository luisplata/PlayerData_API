# SDD Process - player-hero-progression

## Overview
Documentacion del flujo SDD para definir parametros de progresion por heroe: EXP por nivel, puntos perdidos por game y puntos ganados por conversacion.

## Steps
1. Explore: `01-explore.md`
2. Proposal: `02-proposal.md`
3. Spec: `03-spec.md`
4. Design: `04-design.md`
5. Tasks: `05-tasks.md`
6. Apply: `06-apply.md`
7. Verify: `07-verify.md`
8. Archive: `08-archive.md`

## Status
- Explore: completed
- Proposal: completed
- Spec: completed
- Design: completed
- Tasks: completed
- Apply: pending
- Verify: pending
- Archive: pending

## Change Summary
- Configurar progresion por heroe sin agregar columnas nuevas, usando `heroes.metadata`.
- Definir contrato de metadatos para balanceo.
- Diferenciar recompensa minima por intento de conversacion y recompensa por conversacion completa.
- Agregar seed inicial con 1 heroe que incluya estos parametros.
- Mantener compatibilidad con `GetPlayerHeroesUseCase` y respuestas actuales de API.
