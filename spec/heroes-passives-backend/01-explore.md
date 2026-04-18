# Explore - heroes-passives-backend

## Current State
PlayerData_API usa Clean Architecture con entidades, repositorios, use cases, controllers y DI. Existen patrones reutilizables para rewards, transacciones y versionado API.

## Problem
Se necesita una mecanica backend para Heroes con pasivas y flujo de dialogo, fuera de Unity Game Service.

## Considered Approaches
1. Extender v1 directamente.
2. Implementar solo en v2.
3. Capa compartida multi-version.

## Recommendation
Extender v1 por simplicidad, coherencia con el sistema actual de recompensas y menor time-to-market.

## Risks
- Anti-cheat en validacion de respuestas.
- Exposicion accidental de respuestas.
- Race conditions al asignar pasivas.
