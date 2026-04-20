# SDD Process - player-heroes-inventory

## Overview
Documentacion del inventario de heroes por player, incluyendo nivel de conversacion y progresion en dialogos.

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
- Apply: completed
- Verify: completed
- Archive: completed

## Change Summary
- Exponer todos los heroes para un player, incluso si no inicio conversacion.
- Incluir el nivel entero por hero cuando exista progreso.
- Incrementar ese nivel cuando `/api/v1/heroes/dialog/answer` resuelva correctamente.
- Mantener estructura estable con defaults para heroes sin historial.
- No exponer scoring interno ni criterios de evaluacion de dialogos.