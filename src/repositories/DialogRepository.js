/**
 * DialogRepository - Interface Adapter Layer
 * Handles data persistence for Dialog and its questions.
 */
class DialogRepository {
  constructor(database) {
    this.db = database;
  }

  async startDialog(heroId) {
    try {
      const dialog = await this.db('dialogs').where({ heroId }).first();
      if (!dialog) {
        return null;
      }

      const questions = await this.db('dialog_questions')
        .where({ dialogId: dialog.id })
        .orderBy('order_index', 'asc');

      return {
        ...dialog,
        questions: questions.map(question => ({
          id: question.id,
          questionId: question.questionId,
          dialogId: question.dialogId,
          question: question.question,
          order_index: question.order_index
        }))
      };
    } catch (error) {
      throw new Error(`Failed to start dialog: ${error.message}`);
    }
  }

  async validateAnswer(dialogQuestionId, answer) {
    try {
      const question = await this.db('dialog_questions').where({ questionId: dialogQuestionId }).first();
      if (!question) {
        return { valid: false, question: null };
      }

      return {
        valid: String(question.correct_answer).trim().toLowerCase() === String(answer).trim().toLowerCase(),
        question
      };
    } catch (error) {
      throw new Error(`Failed to validate answer: ${error.message}`);
    }
  }
}

module.exports = DialogRepository;