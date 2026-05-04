const fs = require('fs');
const path = require('path');

const db = require('../../DB/db');

function parseArgs(argv) {
  const args = {};

  argv.forEach(entry => {
    if (!entry.startsWith('--')) {
      return;
    }

    const [key, value] = entry.slice(2).split('=');
    args[key] = value;
  });

  return args;
}

function parseMetadata(metadata) {
  if (!metadata) {
    return {};
  }

  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch (error) {
      return {};
    }
  }

  if (typeof metadata === 'object') {
    return metadata;
  }

  return {};
}

function loadPayload(inputPath) {
  if (!inputPath) {
    throw new Error('input file is required for this action');
  }

  const absolutePath = path.resolve(process.cwd(), inputPath);
  const raw = fs.readFileSync(absolutePath, 'utf8');
  const payload = JSON.parse(raw);

  return {
    absolutePath,
    payload
  };
}

function requireField(payload, fieldName) {
  const value = payload[fieldName];

  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `${fieldName} is required in input file and must be a non-empty string`
    );
  }

  return value.trim();
}

function requireArray(payload, fieldName) {
  const value = payload[fieldName];

  if (!Array.isArray(value)) {
    throw new Error(
      `${fieldName} is required in input file and must be an array`
    );
  }

  if (value.length === 0) {
    throw new Error(`${fieldName} must contain at least one item`);
  }

  return value;
}

async function createOrUpdateDialog(payload) {
  const heroId = requireField(payload, 'heroId');
  const dialogId = requireField(payload, 'dialogId');
  const title = requireField(payload, 'title');
  const nodes = requireArray(payload, 'nodes');
  const questions = requireArray(payload, 'questions');

  const metadata = payload.metadata || {};

  // Validar que el héroe existe
  const hero = await db('heroes').where({ heroId }).first();
  if (!hero) {
    throw new Error(`hero '${heroId}' was not found`);
  }

  const now = new Date();

  // Buscar si el diálogo ya existe
  const existingDialog = await db('dialogs').where({ dialogId }).first();

  // Borrar questions viejas si existen
  if (existingDialog) {
    await db('dialog_questions').where({ dialogId: existingDialog.id }).del();
  }

  // Borrar diálogo viejo si existe
  await db('dialogs').where({ dialogId }).del();

  // Insertar nuevo diálogo
  const dialogPayload = {
    dialogId,
    heroId,
    title,
    metadata: JSON.stringify({
      ...metadata,
      nodes
    }),
    created_at: now,
    updated_at: now
  };

  const [dialogDbId] = await db('dialogs').insert(dialogPayload);

  // Insertar preguntas asociadas
  function findNodeSequenceForQuestion(questionObj, nodesList) {
    if (questionObj.nodeSequence) return questionObj.nodeSequence;
    if (questionObj.sequence) return questionObj.sequence;

    const bySequence = nodesList.find(n => n.sequence && (n.sequence === questionObj.nodeSequence || n.sequence === questionObj.sequence));
    if (bySequence) return bySequence.sequence;

    if (questionObj.question) {
      const byText = nodesList.find(n => n.isQuestion && n.text && n.text.trim() === questionObj.question.trim());
      if (byText) return byText.sequence;
    }

    return null;
  }

  const questionRows = questions.map((question, index) => {
    const nodeSequence = findNodeSequenceForQuestion(question, nodes);
    if (!nodeSequence) {
      throw new Error(
        `Unable to associate question '${question.questionId || question.question || index + 1}' to a dialog node sequence`
      );
    }

    return {
      questionId: question.questionId || `${dialogId}-q${index + 1}`,
      dialogId: dialogDbId,
      node_sequence: nodeSequence,
      question: question.question,
      correct_answer: question.correct_answer,
      order_index: question.order_index || index + 1,
      created_at: now,
      updated_at: now
    };
  });

  if (questionRows.length > 0) {
    await db('dialog_questions').insert(questionRows);
  }

  // Devolver lo que se insertó
  const insertedDialog = await db('dialogs').where({ dialogId }).first();
  const insertedQuestions = await db('dialog_questions')
    .where({ dialogId: dialogDbId })
    .orderBy('order_index', 'asc');

  return {
    dialog: {
      ...insertedDialog,
      metadata: parseMetadata(insertedDialog.metadata)
    },
    questions: insertedQuestions
  };
}

async function listDialogs(payload) {
  const heroId =
    payload && typeof payload.heroId === 'string'
      ? payload.heroId.trim()
      : null;

  let query = db('dialogs');

  if (heroId) {
    query = query.where({ heroId });
  }

  const dialogs = await query.orderBy('title', 'asc');

  return {
    count: dialogs.length,
    dialogs: dialogs.map(d => ({
      ...d,
      metadata: parseMetadata(d.metadata)
    }))
  };
}

async function getDialog(payload) {
  const dialogId =
    payload && typeof payload.dialogId === 'string'
      ? payload.dialogId.trim()
      : '';

  if (!dialogId) {
    throw new Error('dialogId is required in input file');
  }

  const dialog = await db('dialogs').where({ dialogId }).first();
  if (!dialog) {
    throw new Error(`dialog '${dialogId}' was not found`);
  }

  const questions = await db('dialog_questions')
    .where({ dialogId: dialog.id })
    .orderBy('order_index', 'asc');

  return {
    dialog: {
      ...dialog,
      metadata: parseMetadata(dialog.metadata)
    },
    questions
  };
}

async function deleteDialog(payload) {
  const dialogId =
    payload && typeof payload.dialogId === 'string'
      ? payload.dialogId.trim()
      : '';

  if (!dialogId) {
    throw new Error('dialogId is required in input file');
  }

  const deletedRows = await db('dialogs').where({ dialogId }).del();

  if (deletedRows === 0) {
    throw new Error(`dialog '${dialogId}' was not found`);
  }

  return {
    dialogId,
    deleted: true,
    deletedRows
  };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const action =
    typeof args.action === 'string' ? args.action.trim().toLowerCase() : '';

  if (!action) {
    throw new Error('action is required. Use --action=create|list|get|delete');
  }

  let inputInfo = null;
  if (['create', 'get', 'delete'].includes(action)) {
    inputInfo = loadPayload(args.input);
  }

  let result;

  if (action === 'create') {
    result = await createOrUpdateDialog(inputInfo.payload);
  } else if (action === 'list') {
    result = await listDialogs(inputInfo ? inputInfo.payload : null);
  } else if (action === 'get') {
    result = await getDialog(inputInfo.payload);
  } else if (action === 'delete') {
    result = await deleteDialog(inputInfo.payload);
  } else {
    throw new Error(`unsupported action '${action}'`);
  }

  const response = {
    success: true,
    action,
    input: inputInfo
      ? path.relative(process.cwd(), inputInfo.absolutePath)
      : null,
    result
  };

  console.log(JSON.stringify(response, null, 2));
}

run()
  .catch(error => {
    const response = {
      success: false,
      error: error.message
    };

    console.error(JSON.stringify(response, null, 2));
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
