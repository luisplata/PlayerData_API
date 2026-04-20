# Explore - player-hero-progression

## Current State
- La tabla `heroes` ya tiene `metadata` tipo JSON (`migrations/20260417000100_create_heroes_table.js`).
- El entity `Hero` valida `heroId`, `name` y que `metadata` sea objeto (`src/entities/Hero.js`).
- `GetPlayerHeroesUseCase` ya parsea `metadata` y normaliza `level` (`src/useCases/heroes/GetPlayerHeroesUseCase.js`).
- No existe seed de heroes. Solo hay `seeds/seed_levels.js`.

## Problem
Necesitamos definir parametros de progresion por heroe:
1. EXP para subir nivel.
2. Puntos que se pierden por game.
3. Puntos minimos ganados por conversacion (aunque no se complete).
4. Puntos ganados por conversacion completa.

Adicionalmente, se requiere un seed inicial con un heroe que incluya esos valores.

## Considered Approaches
1. Agregar nuevas columnas en `heroes`.
2. Guardar configuracion en `heroes.metadata`.
3. Guardar configuracion en `player_hero_progress`.

## Recommendation
Usar `heroes.metadata` para esta primera iteracion.

## Why This Approach
- No requiere migracion de esquema.
- Respeta el patron actual del proyecto para atributos flexibles.
- `GetPlayerHeroesUseCase` ya expone `metadata` parseado.
- Reduce riesgo y tiempo para habilitar balance inicial.

## Risks
- Contrato implicito de metadata si no se valida.
- Valores fuera de rango si no se agregan reglas de negocio.
- Ambiguedad entre intento y conversacion completa si no se separan campos.
- Seed puede pisar datos si no se hace idempotente.
