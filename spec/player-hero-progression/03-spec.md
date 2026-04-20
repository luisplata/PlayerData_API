# Hero Progression Metadata Specification

## Purpose
Definir el comportamiento esperado para almacenar y exponer configuracion de progresion por heroe usando metadata.

## Requirements

### Requirement: Progression Metadata Contract
The system MUST support hero progression metadata with numeric fields for level progression and score adjustments.

#### Scenario: Valid progression metadata
- GIVEN a hero payload with `xpPerLevel`, `pointsLostPerGame`, `minPointsGainedPerConversation`, `pointsGainedPerConversationComplete`
- WHEN the hero is validated and persisted
- THEN all progression fields are accepted as numeric values
- AND values are stored inside hero metadata

#### Scenario: Invalid progression metadata
- GIVEN a hero payload with non-numeric or negative progression values
- WHEN the hero is validated
- THEN the system returns a validation error

### Requirement: Hero Catalog Response Compatibility
The system MUST return progression metadata in hero catalog responses without breaking existing response shape.

#### Scenario: Hero catalog includes progression metadata
- GIVEN at least one hero with progression metadata configured
- WHEN `GetPlayerHeroesUseCase` executes
- THEN each hero response includes parsed metadata
- AND progression fields are present when configured

#### Scenario: Hero without progression metadata
- GIVEN a hero without progression keys in metadata
- WHEN `GetPlayerHeroesUseCase` executes
- THEN the response remains valid
- AND metadata defaults to existing object semantics

### Requirement: Seed Bootstrap for Hero Progression
The system MUST provide a seed that inserts one hero containing progression metadata.

#### Scenario: Seed creates one configured hero
- GIVEN an empty or reset database
- WHEN `knex seed:run` is executed
- THEN one hero is created by `seed_heroes.js`
- AND metadata includes all four progression fields

#### Scenario: Seed rerun remains stable
- GIVEN an existing hero with the same `heroId`
- WHEN the hero seed is executed again
- THEN the process does not create duplicates
- AND final dataset stays consistent

### Requirement: Conversation Reward Differentiation
The system MUST distinguish between minimum points earned by attempt and points earned by fully completed conversation.

#### Scenario: Attempt without full completion
- GIVEN a conversation attempt that does not fully complete
- WHEN rewards are read from hero metadata
- THEN `minPointsGainedPerConversation` is the applicable value

#### Scenario: Full conversation completion
- GIVEN a conversation resolved correctly and fully completed
- WHEN rewards are read from hero metadata
- THEN `pointsGainedPerConversationComplete` is the applicable value

## Coverage Summary
- Happy paths: covered
- Edge cases: covered
- Error states: covered
