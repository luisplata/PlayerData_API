# Single Hero Dialog Seed Specification

## Purpose
Definir requisitos verificables para seedear y validar un flujo end-to-end de dialogo para un unico heroe existente, incluyendo preguntas y respuestas posibles.

## ADDED Requirements

### Requirement: Single Hero Seed Baseline
The system MUST support a deterministic seed dataset for exactly one existing hero to enable full-flow validation.

#### Scenario: Seed precondition met
- GIVEN an existing hero identified by stable `heroId` (`hero-nova`)
- WHEN the dialog seed process starts
- THEN the process continues with dialog/question/option insertion
- AND the hero is not recreated

#### Scenario: Hero missing blocks seed
- GIVEN no hero matches the configured `heroId`
- WHEN the dialog seed process starts
- THEN the process fails fast
- AND returns a clear precondition error

### Requirement: Production Migration Handoff
The canonical dataset MUST be represented as data migration(s) before archive so production deployment can rely on `migrate:latest`.

#### Scenario: Migration parity with seed data
- GIVEN canonical dialog seeds are defined for one hero
- WHEN migration handoff is prepared
- THEN migration data is equivalent in topology and payload to the validated seed dataset
- AND no required node/transition is lost

#### Scenario: Archive gate
- GIVEN the change is ready for `08-archive.md`
- WHEN archive checklist is evaluated
- THEN equivalent migration(s) already exist and are tracked by Knex migrations history
- AND archive cannot be marked complete without that handoff

### Requirement: Dialog Node Model
Each dialog node MUST define sequence metadata and transition hints with this minimum shape: `sequence`, `emotion`, `nextSequence`, `isQuestion`, `possibleAnswers`.

#### Scenario: Non-question node
- GIVEN a dialog node with `isQuestion = false`
- WHEN the node is loaded
- THEN `possibleAnswers` is empty or null
- AND transition follows `nextSequence`

#### Scenario: Question node
- GIVEN a dialog node with `isQuestion = true`
- WHEN the node is loaded
- THEN `possibleAnswers` contains at least 2 options
- AND each option has deterministic transition metadata

### Requirement: UI-Limited Dialog Text Length
Dialog and question text MUST be capped at 280 characters to fit the limited UI without truncation.

#### Scenario: Text within limit
- GIVEN a dialog/question text of 280 characters or fewer
- WHEN the record is persisted
- THEN the text is accepted
- AND it remains fully visible in the limited UI

#### Scenario: Text exceeds limit
- GIVEN a dialog/question text longer than 280 characters
- WHEN the record is persisted
- THEN the database or validation layer rejects it
- AND the error explains the 280-character cap

### Requirement: Canonical Branching-Convergence Flow
The initial dataset MUST implement this exact flow topology: `seq-1 -> seq-2 -> question-1 -> (seq-3 | seq-4) -> seq-5 -> seq-6 -> end`.

#### Scenario: Option 1 branch continuity
- GIVEN the player reaches `question-1`
- WHEN option 1 is selected
- THEN the next node is `seq-3`
- AND `seq-3` transitions to `seq-5`

#### Scenario: Option 2 branch continuity
- GIVEN the player reaches `question-1`
- WHEN option 2 is selected
- THEN the next node is `seq-4`
- AND `seq-4` transitions to `seq-5`

#### Scenario: Shared trunk after answer
- GIVEN the player answered correctly or incorrectly
- WHEN the branch node finishes (`seq-3` or `seq-4`)
- THEN progression converges to `seq-5`
- AND continues to `seq-6` before terminal end

### Requirement: Conversation Progress Visibility
The dialog flow MUST expose the current step and next step so the UI can show how the conversation advances.

#### Scenario: Progress after each answer
- GIVEN the player selects an answer in `question-1`
- WHEN the answer is processed
- THEN the response exposes the `currentSequence` and `nextSequence`
- AND the UI can render the next conversation step without guessing

#### Scenario: Terminal step visible
- GIVEN the conversation reaches `seq-6`
- WHEN the final step is processed
- THEN the response marks the conversation as completed
- AND there is no further `nextSequence`

### Requirement: Conversation Completion Scoring
When the conversation finishes, the system MUST determine the player score from the hero conversation metadata.

#### Scenario: Full completion score
- GIVEN the conversation reaches its terminal end
- WHEN the completion is evaluated
- THEN the awarded points are derived from `pointsGainedPerConversationComplete`
- AND the final result is associated with the player/hero conversation

#### Scenario: Completion metadata present
- GIVEN the hero metadata contains conversation scoring fields
- WHEN the hero is loaded
- THEN the system can read `minPointsGainedPerConversation` and `pointsGainedPerConversationComplete`
- AND the chosen points are deterministic

### Requirement: Transition Validation
The dialog graph MUST be validated to prevent broken progression.

#### Scenario: Valid transition set
- GIVEN all `nextSequence` and option transitions point to existing sequences or terminal state
- WHEN validation runs
- THEN the seed is accepted

#### Scenario: Invalid transition reference
- GIVEN one option points to non-existing sequence
- WHEN validation runs
- THEN seed is rejected
- AND failing sequence/option is reported

### Requirement: i18n-Ready Content Keys
Dialog and options SHOULD be i18n-ready by using stable text identifiers.

#### Scenario: Key-based content
- GIVEN dialog node payload
- WHEN content fields are evaluated
- THEN `textKey`/`emotionKey` style identifiers are available
- AND raw localized text remains optional per environment

### Requirement: End-to-End Validation With One Hero
The project MUST define E2E test cases proving full flow for one hero.

#### Scenario: Happy path E2E
- GIVEN hero exists and seed data is loaded
- WHEN client starts dialog and answers expected path
- THEN all sequences resolve in order
- AND final state is reached without missing nodes

#### Scenario: Alternate branch E2E
- GIVEN seeded branching question
- WHEN client selects alternate option
- THEN flow reaches alternate sequence
- AND no invalid transition occurs

## Acceptance Criteria
- Dataset for 1 hero can be executed repeatedly in non-production environments.
- The baseline hero for the dataset is `hero-nova`.
- Canonical dataset is available in migration form for production rollout.
- Every seeded dialog node satisfies the required model fields.
- No dialog/question text exceeds 280 characters.
- The conversation flow exposes progression steps (`currentSequence` / `nextSequence`) to the UI.
- The completion step can determine the final points for the player.
- The canonical topology is present exactly once: `seq-1 -> seq-2 -> question-1 -> (seq-3 | seq-4) -> seq-5 -> seq-6 -> end`.
- Both answers from `question-1` have valid continuation and reconverge in `seq-5`.
- No orphan transitions exist in `nextSequence` or answer-driven jumps.
- At least one branching question is covered in E2E test plan.
- Seed failure modes (hero missing, bad transitions) are explicitly verifiable.

## Test Cases (E2E + Validation)
1. Precondition test: hero exists by configured `heroId`.
2. Seed integrity test: insertion succeeds following reference order.
3. Branch A traversal: `seq-1 -> seq-2 -> question-1(option1) -> seq-3 -> seq-5 -> seq-6 -> end`.
4. Branch B traversal: `seq-1 -> seq-2 -> question-1(option2) -> seq-4 -> seq-5 -> seq-6 -> end`.
5. Convergence test: both branches land in same `seq-5` node ID.
6. Negative validation test: invalid `nextSequence` is rejected.
7. Negative validation test: question node without options is rejected.
8. Migration parity test: data loaded by migration matches validated canonical dataset.
9. Progress visibility test: each answer response exposes the current and next sequence.
10. Completion scoring test: terminal completion returns deterministic awarded points.

## Coverage Summary
- Happy paths: covered
- Edge cases: covered
- Error states: covered
