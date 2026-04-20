exports.seed = async function (knex) {
  const heroId = 'hero-nova';
  const dialogId = 'dialog-nova-intro-v1';
  const questionId = 'question-nova-1';
  const now = new Date();

  const nodes = [
    {
      sequence: 'seq-1',
      emotion: 'neutral',
      text: 'Nova te saluda y te explica que esta conversacion define tu progreso con el heroe.',
      nextSequence: 'seq-2',
      isQuestion: false,
      possibleAnswers: []
    },
    {
      sequence: 'seq-2',
      emotion: 'confianza',
      text: 'Nova te da contexto y te prepara para una pregunta de decision.',
      nextSequence: 'question-1',
      isQuestion: false,
      possibleAnswers: []
    },
    {
      sequence: 'question-1',
      emotion: 'sorpresa',
      text: 'Si ves a un aliado en riesgo, tu prioridad es protegerlo antes que buscar puntos?',
      nextSequence: null,
      isQuestion: true,
      possibleAnswers: [
        {
          optionKey: 'a',
          optionText: 'Si, priorizo al aliado.',
          nextSequence: 'seq-3',
          isCorrect: true
        },
        {
          optionKey: 'b',
          optionText: 'No, primero busco ventaja individual.',
          nextSequence: 'seq-4',
          isCorrect: false
        }
      ]
    },
    {
      sequence: 'seq-3',
      emotion: 'confianza',
      text: 'Buena decision: el trabajo en equipo acelera tu progreso con Nova.',
      nextSequence: 'seq-5',
      isQuestion: false,
      possibleAnswers: []
    },
    {
      sequence: 'seq-4',
      emotion: 'enojo',
      text: 'Nova te corrige: sin equipo no hay consistencia, pero podes recuperarte.',
      nextSequence: 'seq-5',
      isQuestion: false,
      possibleAnswers: []
    },
    {
      sequence: 'seq-5',
      emotion: 'neutral',
      text: 'Ahora consolidamos lo aprendido para cerrar la conversacion.',
      nextSequence: 'seq-6',
      isQuestion: false,
      possibleAnswers: []
    },
    {
      sequence: 'seq-6',
      emotion: 'determinacion',
      text: 'Conversacion completada: Nova registra tu resultado final.',
      nextSequence: null,
      isQuestion: false,
      possibleAnswers: []
    }
  ];

  const hero = await knex('heroes').where({ heroId }).first();
  if (!hero) {
    throw new Error(
      `Missing required hero '${heroId}' before running dialog seed.`
    );
  }

  await knex('dialog_questions').where({ questionId }).del();
  await knex('dialogs').where({ dialogId }).del();

  const [dialogDbId] = await knex('dialogs').insert({
    dialogId,
    heroId,
    title: 'Nova Intro Conversation',
    metadata: JSON.stringify({
      version: 1,
      startSequence: 'seq-1',
      completedSequence: 'seq-6',
      nodes,
      responseContract: [
        'currentSequence',
        'nextSequence',
        'completed',
        'pointsAwarded'
      ]
    }),
    created_at: now,
    updated_at: now
  });

  await knex('dialog_questions').insert({
    questionId,
    dialogId: dialogDbId,
    question: nodes[2].text,
    correct_answer: 'a',
    order_index: 1,
    created_at: now,
    updated_at: now
  });
};
