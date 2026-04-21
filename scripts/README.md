# Content Admin Scripts

Este directorio documenta los scripts internos para administrar contenido de la app sin interfaz gráfica y sin interacción por consola.

## Objetivo

La regla es simple: cada script debe poder ejecutarse de una sola vez, con toda la información ya definida dentro del propio script o cargada desde un archivo fijo y versionado.

No se debe pedir entrada por `stdin`, `readline`, `prompt`, `inquirer` ni esperar confirmaciones tipo "presioná Enter" en cada paso. Si el flujo necesita datos, esos datos tienen que venir ya embebidos en el script o desde una fuente local conocida antes de ejecutar.

## Cuándo usar estos scripts

Usalos para:

- Crear o actualizar contenido de gameplay.
- Sembrar datos base de héroes, diálogos, pasivas y catálogos similares.
- Reproducir estados conocidos de base de datos en desarrollo.
- Migrar contenido entre versiones sin depender de una UI externa.

No son la capa de consumo final para el cliente del juego. El cliente debe consumir el contenido por API; estos scripts existen para cargar y mantener ese contenido.

## Convención obligatoria

1. El script debe ejecutarse completo sin interacción manual.
2. El dataset debe estar dentro del archivo o en un archivo local fijo importado por el script.
3. El script debe ser idempotente cuando aplique: borrar primero, insertar después, o usar `upsert`/reemplazo controlado.
4. La lógica de negocio debe quedar en el backend, no en un prompt manual.
5. Si un script depende de un héroe, diálogo o tabla previa, debe validar esa dependencia al inicio y fallar con un error claro.

## Patrón recomendado

El patrón que ya usa el seeder de diálogos es el correcto para este caso:

- Definir IDs estables al principio.
- Declarar el payload completo como constantes.
- Validar dependencias antes de insertar.
- Borrar registros relacionados cuando sea necesario.
- Insertar todo en una sola ejecución.

### Ejemplo de referencia

- [seeds/seed_heroes.js](../seeds/seed_heroes.js)
- [seeds/seed_heroes_dialog_nova.js](../seeds/seed_heroes_dialog_nova.js)
- [seeds/seed_levels.js](../seeds/seed_levels.js)

## Recomendación de estructura

Para scripts nuevos, usar una estructura parecida a esta:

```js
exports.seed = async function (knex) {
  const contentId = 'content-nova-v1';
  const now = new Date();

  const payload = {
    title: 'Nova Intro Conversation',
    nodes: [/* datos completos */]
  };

  const dependency = await knex('heroes').where({ heroId: 'hero-nova' }).first();
  if (!dependency) {
    throw new Error('Missing required hero before running this script.');
  }

  await knex('dialogs').where({ dialogId: contentId }).del();
  await knex('dialogs').insert({
    dialogId: contentId,
    heroId: dependency.heroId,
    title: payload.title,
    metadata: JSON.stringify(payload),
    created_at: now,
    updated_at: now
  });
};
```

## Qué evitar

- Pedir datos por consola durante la ejecución.
- Depender de pasos manuales intermedios.
- Mezclar contenido de prueba con contenido productivo sin IDs claros.
- Guardar datos parciales si el contenido depende de estructuras anidadas completas.

## Ejecución

Los seeds actuales se ejecutan con:

```bash
npm run seed
```

O directamente con Knex:

```bash
npx knex seed:run
```

Si agregamos scripts específicos para contenido, este README debe actualizarse con el comando exacto y con el archivo fuente de cada script.

## Primer Script: Heroes CRUD (no interactivo)

Se agregó el script:

- [scripts/heroes/manageHeroes.js](./heroes/manageHeroes.js)

Este script permite administrar héroes sin prompts y sin pausas manuales.

Acciones soportadas:

1. `create` (crear héroe)
2. `list` (listar héroes)
3. `get` (consultar un héroe)
4. `update` (reemplazar datos de un héroe)
5. `delete` (eliminar héroe)

### Comandos npm listos

```bash
npm run heroes:admin:create
npm run heroes:admin:list
npm run heroes:admin:get
npm run heroes:admin:update
npm run heroes:admin:delete
```

### Archivos de datos fijos

- [scripts/heroes/data/create.hero-example.json](./heroes/data/create.hero-example.json)
- [scripts/heroes/data/get.hero-example.json](./heroes/data/get.hero-example.json)
- [scripts/heroes/data/update.hero-example.json](./heroes/data/update.hero-example.json)
- [scripts/heroes/data/delete.hero-example.json](./heroes/data/delete.hero-example.json)

Para cambiar qué héroe crear/consultar/actualizar/eliminar, se edita el JSON correspondiente y se vuelve a ejecutar el comando. No hay ingreso de datos en runtime.

## Segundo Script: Dialogs CRUD (no interactivo)

Se agregó el script:

- [scripts/dialogs/manageDialogs.js](./dialogs/manageDialogs.js)

Este script permite administrar diálogos completos sin prompts. Carga la estructura entera desde un archivo JSON (nodos, preguntas, metadata) e inserta todo en un paso.

Acciones soportadas:

1. `create` (crear o reemplazar un diálogo completo con sus preguntas)
2. `list` (listar diálogos, opcionalmente filtrados por heroId)
3. `get` (consultar un diálogo con sus preguntas)
4. `delete` (eliminar un diálogo)

### Comandos npm listos

```bash
npm run dialogs:admin:create
npm run dialogs:admin:list
npm run dialogs:admin:get
npm run dialogs:admin:delete
```

### Archivos de datos fijos

- [scripts/dialogs/data/create.dialog-example.json](./dialogs/data/create.dialog-example.json) — Estructura completa de diálogo con nodos y preguntas
- [scripts/dialogs/data/list.dialog-example.json](./dialogs/data/list.dialog-example.json) — Opcional; si tiene heroId, filtra por ese héroe
- [scripts/dialogs/data/get.dialog-example.json](./dialogs/data/get.dialog-example.json) — Requiere dialogId
- [scripts/dialogs/data/delete.dialog-example.json](./dialogs/data/delete.dialog-example.json) — Requiere dialogId

### Estructura esperada en create.dialog-example.json

```json
{
  "heroId": "hero-nova",
  "dialogId": "dialog-nova-intro-v1",
  "title": "Nova Intro Conversation",
  "metadata": {
    "version": 1,
    "startSequence": "seq-1",
    "completedSequence": "seq-6",
    "responseContract": ["currentSequence", "nextSequence", "completed", "pointsAwarded"]
  },
  "nodes": [
    {
      "sequence": "seq-1",
      "emotion": "neutral",
      "text": "...",
      "nextSequence": "seq-2",
      "isQuestion": false,
      "possibleAnswers": []
    }
  ],
  "questions": [
    {
      "questionId": "question-nova-1",
      "question": "...",
      "correct_answer": "a",
      "order_index": 1
    }
  ]
}
```

Notas:
- El heroId debe existir antes de crear el diálogo.
- Si ya existe un diálogo con ese dialogId, se borra completamente junto con sus preguntas viejas y se inserta la versión nueva.
- Los nodos van embebidos en metadata.nodes.
- Las preguntas van en un array separado y se vinculan por order_index.
