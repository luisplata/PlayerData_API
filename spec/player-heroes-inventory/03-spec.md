# Hero Inventory by Player Specification

## Purpose
Definir el comportamiento funcional para consultar todos los heroes de un player y el nivel de progreso asociado a cada hero, manteniendo una estructura de respuesta estable para heroes sin historial.

## Requirements

### Requirement: Complete Hero Inventory
The system MUST return all heroes available in the catalog for a given `playerId`, even when the player has not started a conversation with any hero, and MUST preserve the same response structure for every hero item.

#### Scenario: Player has no prior conversations
- GIVEN a valid `playerId`
- AND the player has no hero conversation records
- WHEN the inventory endpoint is called
- THEN the response includes every hero from the catalog
- AND each hero is returned with a progress level of `0`
- AND each hero item includes the default hero data fields expected by the client

#### Scenario: Player has prior conversations
- GIVEN a valid `playerId`
- AND the player already started conversations with some heroes
- WHEN the inventory endpoint is called
- THEN the response includes every hero from the catalog
- AND heroes with progress include their current level
- AND heroes without progress still include the same default data fields

### Requirement: Hero Progress Level
The system MUST expose a numeric level for each hero and SHALL represent the value as an integer, defaulting to `0` when there is no prior progress.

### Requirement: No Dialog Scoring Exposure
The system MUST NOT expose dialog scoring data or answer evaluation criteria in the player hero inventory response.

#### Scenario: Inventory response excludes scoring internals
- GIVEN a valid `playerId`
- WHEN the inventory endpoint is called
- THEN hero items include only client-facing progress fields
- AND internal scoring or answer evaluation data is not returned

#### Scenario: Hero with progress
- GIVEN a hero with one or more successful dialog answers for the player
- WHEN the inventory endpoint is called
- THEN the hero item includes an integer level greater than `0`

#### Scenario: Hero without progress
- GIVEN a hero with no dialog progress for the player
- WHEN the inventory endpoint is called
- THEN the hero item includes level `0`

### Requirement: Progress Increment on Correct Answer
The system MUST increment the level for the player-hero relation when `/api/v1/heroes/dialog/answer` validates a correct answer.

#### Scenario: Correct answer increments level
- GIVEN a player is answering a hero dialog
- WHEN `/api/v1/heroes/dialog/answer` accepts a correct answer
- THEN the stored level for that player and hero increases by `1`
- AND the next inventory query reflects the updated level

#### Scenario: Wrong answer does not increment level
- GIVEN a player is answering a hero dialog
- WHEN `/api/v1/heroes/dialog/answer` rejects the answer
- THEN the stored level remains unchanged
- AND the next inventory query shows the same level as before

### Requirement: Deterministic Player Lookup
The system MUST use the provided `playerId` to resolve the player-specific hero inventory.

#### Scenario: Query by player id
- GIVEN a valid `playerId`
- WHEN the inventory endpoint is called
- THEN the response is scoped only to that player
- AND no other player's progress is included

## Coverage Summary
- Happy paths: covered
- Edge cases: covered
- Error states: covered