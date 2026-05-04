/**
 * DialogRepository - Interface Adapter Layer
 * Handles data persistence for Dialog and its questions.
 */
class DialogRepository {
  constructor(database) {
    this.db = database;
  }

  static parseMetadata(metadata) {
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

  static findQuestionNode(nodes, question, questionId) {
    if (!Array.isArray(nodes)) {
      return null;
    }

    // If the stored question row contains an explicit node_sequence, prefer that.
    if (question && question.node_sequence) {
      const byNodeSequence = nodes.find(
        node => node && node.sequence === question.node_sequence
      );
      if (byNodeSequence) return byNodeSequence;
    }

    const bySequence = nodes.find(node => node && node.sequence === questionId);
    if (bySequence) {
      return bySequence;
    }

    const normalizedQuestionText = String(question.question || '')
      .trim()
      .toLowerCase();
    const byText = nodes.find(node => {
      if (!node || node.isQuestion !== true || typeof node.text !== 'string') {
        return false;
      }

      return node.text.trim().toLowerCase() === normalizedQuestionText;
    });

    if (byText) {
      return byText;
    }

    return nodes.find(node => node && node.isQuestion === true) || null;
  }

  static findSelectedOption(questionNode, answer) {
    if (!questionNode || !Array.isArray(questionNode.possibleAnswers)) {
      return null;
    }

    const normalizedAnswer = String(answer || '')
      .trim()
      .toLowerCase();
    return (
      questionNode.possibleAnswers.find(option => {
        if (!option) {
          return false;
        }

        const optionKey = String(option.optionKey || '')
          .trim()
          .toLowerCase();
        const optionText = String(option.optionText || '')
          .trim()
          .toLowerCase();
        return (
          optionKey === normalizedAnswer || optionText === normalizedAnswer
        );
      }) || null
    );
  }

  async startDialog(heroId) {
    try {
      let q = this.db('dialogs').where({ heroId });
      if (typeof q.orderByRaw === 'function') {
        q = q.orderByRaw('RAND()');
      } else if (typeof q.orderBy === 'function') {
        q = q.orderBy('id', 'asc');
      }

      const dialog = await q.first();
      if (!dialog) {
        return null;
      }

      const questions = await this.db('dialog_questions')
        .where({ dialogId: dialog.id })
        .orderBy('order_index', 'asc');

      const metadata = DialogRepository.parseMetadata(dialog.metadata);

      const mappedQuestions = questions.map(question => {
        const questionNode = DialogRepository.findQuestionNode(
          metadata.nodes,
          question,
          question.questionId
        );

        const nodeSequence =
          question.node_sequence || (questionNode ? questionNode.sequence : null);

        const rawPossibleAnswers =
          questionNode && Array.isArray(questionNode.possibleAnswers)
            ? questionNode.possibleAnswers
            : [];

        const possibleAnswers = rawPossibleAnswers.map(opt => ({
          optionKey: opt.optionKey,
          optionText: opt.optionText,
          nextSequence: opt.nextSequence || null
        }));

        const qObj = {
          id: question.id,
          questionId: question.questionId,
          dialogId: question.dialogId,
          question: question.question,
          order_index: question.order_index
        };

        if (nodeSequence !== null && nodeSequence !== undefined) {
          qObj.node_sequence = nodeSequence;
        }

        if (questionNode) {
          qObj.node = {
            sequence: questionNode.sequence,
            emotion: questionNode.emotion,
            text: questionNode.text,
            possibleAnswers
          };
        }

        return qObj;
      });

      return {
        ...dialog,
        metadata,
        questions: mappedQuestions
      };
    } catch (error) {
      throw new Error(`Failed to start dialog: ${error.message}`);
    }
  }

  async validateAnswer(dialogQuestionId, answer) {
    try {
      const question = await this.db('dialog_questions')
        .where({ questionId: dialogQuestionId })
        .first();
      if (!question) {
        return { valid: false, question: null };
      }

      return {
        valid:
          String(question.correct_answer).trim().toLowerCase() ===
          String(answer).trim().toLowerCase(),
        question
      };
    } catch (error) {
      throw new Error(`Failed to validate answer: ${error.message}`);
    }
  }

  async resolveAnswerProgress(heroId, questionId, answer) {
    try {
      const question = await this.db('dialog_questions')
        .where({ questionId })
        .first();
      if (!question) {
        return {
          currentSequence: questionId,
          nextSequence: null,
          completed: false
        };
      }

      const dialog = await this.db('dialogs')
        .where({ id: question.dialogId, heroId })
        .first();

      const metadata = DialogRepository.parseMetadata(
        dialog ? dialog.metadata : null
      );
      const questionNode = DialogRepository.findQuestionNode(
        metadata.nodes,
        question,
        questionId
      );

      if (!questionNode) {
        return {
          currentSequence: questionId,
          nextSequence: null,
          completed: false
        };
      }

      const selectedOption = DialogRepository.findSelectedOption(
        questionNode,
        answer
      );
      const nextSequence = selectedOption
        ? selectedOption.nextSequence || null
        : questionNode.nextSequence || null;

      const completedSequence =
        typeof metadata.completedSequence === 'string'
          ? metadata.completedSequence
          : null;

      const completed =
        completedSequence !== null
          ? questionNode.sequence === completedSequence && nextSequence === null
          : nextSequence === null;

      return {
        currentSequence: questionNode.sequence || questionId,
        nextSequence,
        completed
      };
    } catch (error) {
      throw new Error(`Failed to resolve answer progress: ${error.message}`);
    }
  }
}

module.exports = DialogRepository;
