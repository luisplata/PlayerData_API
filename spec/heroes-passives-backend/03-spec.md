# Heroes Passive Dialog Specification

## Purpose
Definir comportamiento funcional para Heroes con dialogos y asignacion de pasivas.

## Requirements

### Requirement: Hero Catalog Management
The system MUST allow authorized backend clients to create heroes with metadata and MUST return a list of available heroes.

#### Scenario: Create hero successfully
- GIVEN valid hero metadata
- WHEN CreateHero is called
- THEN the hero is persisted and returned with identifier
- AND creation timestamp is included

#### Scenario: Reject invalid hero metadata
- GIVEN missing required fields
- WHEN CreateHero is called
- THEN the system returns validation error

### Requirement: Dialog Initialization
The system MUST return dialog questions without exposing any correct answer values.

#### Scenario: Start dialog successfully
- GIVEN an existing hero with dialog
- WHEN StartDialog is called
- THEN the response includes dialog metadata and questions
- AND the response MUST NOT include correct answers

#### Scenario: Hero without dialog
- GIVEN an existing hero without dialog
- WHEN StartDialog is called
- THEN the system returns an empty question set

### Requirement: Answer Validation and Passive Assignment
The system MUST validate answers server-side and SHALL assign passive atomically when success criteria are met.

#### Scenario: Correct answer grants passive
- GIVEN a player eligible for a passive
- WHEN SendAnswer is called with a correct answer
- THEN the answer is accepted
- AND passive assignment is persisted once

#### Scenario: Duplicate assignment is blocked
- GIVEN a player already assigned the passive
- WHEN SendAnswer succeeds again
- THEN the system MUST NOT duplicate the assignment

### Requirement: Passive Query
The system MUST return player current passive state and MAY include passive catalog entries.

#### Scenario: Player with passive
- GIVEN a player with assigned passive
- WHEN GetPassive is called
- THEN the response includes assigned passive and catalog

#### Scenario: Player without passive
- GIVEN a player with no assigned passive
- WHEN GetPassive is called
- THEN the response includes null assigned passive and catalog

## Coverage Summary
- Happy paths: covered
- Edge cases: covered
- Error states: covered
