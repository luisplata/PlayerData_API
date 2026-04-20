# Tasks - single-hero-dialog-seed

## Phase 1: Scope and Preconditions

- [x] 1.1 Confirmar `heroId` objetivo ya existente y documentar precondicion de seed.
- [x] 1.2 Definir contrato de nodo de dialogo obligatorio (`sequence`, `emotion`, `nextSequence`, `isQuestion`, `possibleAnswers`).
- [x] 1.3 Definir catalogo inicial de emociones permitidas para el dataset de 1 heroe.

## Phase 2: Seed Data Modeling

- [x] 2.1 Diseñar dataset canonico: `seq-1 -> seq-2 -> question-1 -> (seq-3|seq-4) -> seq-5 -> seq-6 -> end`.
- [x] 2.2 Definir estructura de `possibleAnswers` con `optionKey`, `optionTextKey`, `nextSequence` y marca opcional de correccion.
- [x] 2.3 Incorporar campos i18n-ready (`textKey`, `optionTextKey`) y reglas de naming.
- [x] 2.4 Documentar que `question-1` siempre tiene dos respuestas y ambas poseen dialogo de continuacion.
- [x] 2.5 Limitar el texto visible de cada nodo/pregunta a 280 caracteres.

## Phase 3: Referential Insertion Plan

- [x] 3.1 Documentar orden de insercion: `hero -> dialog nodes -> question/options`.
- [x] 3.2 Implementar el mismo grafo de dialogo en `seeds/` y en la migracion de datos.
- [x] 3.3 Definir estrategia de idempotencia para re-ejecutar seeds en dev/qa.
- [x] 3.4 Definir limpieza en orden inverso para rollback: `options/questions -> dialogs`.
- [x] 3.5 Documentar el contrato de respuesta con avance visible (`currentSequence`, `nextSequence`).

## Phase 4: Validation Rules

- [x] 4.1 Definir validacion de secuencias unicas por heroe.
- [x] 4.2 Definir validacion de transiciones (`nextSequence` de nodos y opciones).
- [x] 4.3 Definir validacion de convergencia: `seq-3` y `seq-4` deben llegar a `seq-5`.
- [x] 4.4 Definir validaciones negativas obligatorias (pregunta sin opciones, transicion inexistente, heroe ausente).
- [x] 4.5 Definir validacion del tope de 280 caracteres para el texto visible.
- [x] 4.6 Definir validacion del resultado de conversacion (`currentSequence`, `nextSequence`, `completed`, `pointsAwarded`).

## Phase 5: End-to-End Test Plan (1 Hero)

- [x] 5.1 Rama A: `seq-1 -> seq-2 -> question-1(option1) -> seq-3 -> seq-5 -> seq-6 -> end`.
- [x] 5.2 Rama B: `seq-1 -> seq-2 -> question-1(option2) -> seq-4 -> seq-5 -> seq-6 -> end`.
- [x] 5.3 Caso negativo: `heroId` inexistente bloquea seed con error claro.
- [x] 5.4 Caso negativo: opcion con `nextSequence` invalido falla validacion.
- [x] 5.5 Caso de convergencia: ambas ramas comparten el mismo `seq-5`.
- [x] 5.6 Caso de repeticion: seed re-ejecutable sin duplicados o inconsistencias.
- [x] 5.7 Caso de progreso visible: cada respuesta expone la secuencia actual y la siguiente.
- [x] 5.8 Caso de cierre: al llegar a `seq-6`, el sistema determina el puntaje final del player.

## Phase 6: Risks and Rollback Readiness

- [x] 6.1 Registrar riesgos operativos (FK, transiciones rotas, drift de keys i18n).
- [x] 6.2 Definir checklist de rollback ejecutable y criterio de activacion.
- [x] 6.3 Preparar plantilla de evidencia para `06-apply.md` y matriz de pruebas para `07-verify.md`.

## Phase 7: Production Migration Handoff (Required Before Archive)

- [x] 7.1 Crear migracion(es) de datos equivalente(s) al seed canonico.
- [x] 7.2 Verificar paridad seed vs migracion (mismos nodos, transiciones y convergencia).
- [x] 7.3 Definir despliegue productivo basado en `migrate:latest` (sin dependencia de `seed:run`).
- [ ] 7.4 Marcar `08-archive.md` solo cuando el handoff a migraciones este completo.
- [x] 7.5 Agregar migracion de esquema que limite `dialog_questions.question` a 280 caracteres.

## Phase 8: Progression and Scoring Contract

- [x] 8.1 Definir la forma de respuesta que expone `currentSequence`, `nextSequence`, `completed`, `pointsAwarded`.
- [x] 8.2 Definir de donde sale el puntaje final (`hero.metadata.pointsGainedPerConversationComplete`).
- [x] 8.3 Definir comportamiento si la conversacion no se completa y como se refleja el progreso parcial.
- [x] 8.4 Preparar evidencia de que el mismo contrato de scoring aplica tanto al seed como a la migracion.
