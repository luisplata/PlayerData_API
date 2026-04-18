/**
 * StartDialogUseCase - Use Case Layer
 * Retrieves dialog data and strips answer keys before returning it.
 */
class StartDialogUseCase {
  constructor(dialogRepository) {
    this.dialogRepository = dialogRepository;
  }

  async execute(heroId) {
    try {
      const dialog = await this.dialogRepository.startDialog(heroId);

      if (!dialog) {
        return {
          success: true,
          dialog: {
            heroId,
            questions: []
          }
        };
      }

      const safeQuestions = (dialog.questions || []).map((question) => {
        const {
          correct_answer,
          correctAnswer,
          ...safeQuestion
        } = question;

        return safeQuestion;
      });

      return {
        success: true,
        dialog: {
          ...dialog,
          questions: safeQuestions
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = StartDialogUseCase;