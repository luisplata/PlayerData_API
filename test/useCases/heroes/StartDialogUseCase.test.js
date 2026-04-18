const { expect } = require('chai');
const StartDialogUseCase = require('../../../src/useCases/heroes/StartDialogUseCase');

describe('StartDialogUseCase', () => {
  it('returns dialog questions without exposing answers', async () => {
    const dialogRepository = {
      startDialog: async () => ({
        id: 10,
        heroId: 'hero-001',
        title: 'Welcome',
        metadata: { stage: 1 },
        questions: [
          { questionId: 'q1', question: 'Who are you?', correct_answer: 'hero', order_index: 1 },
          { questionId: 'q2', question: 'Ready?', correct_answer: 'yes', order_index: 2 }
        ]
      })
    };

    const useCase = new StartDialogUseCase(dialogRepository);
    const result = await useCase.execute('hero-001');

    expect(result.success).to.equal(true);
    expect(result.dialog).to.have.property('id', 10);
    expect(result.dialog.questions).to.have.length(2);
    expect(result.dialog.questions[0]).to.not.have.property('correct_answer');
    expect(result.dialog.questions[1]).to.not.have.property('correct_answer');
  });

  it('returns empty question set when hero has no dialog', async () => {
    const dialogRepository = {
      startDialog: async () => null
    };

    const useCase = new StartDialogUseCase(dialogRepository);
    const result = await useCase.execute('hero-002');

    expect(result.success).to.equal(true);
    expect(result.dialog.questions).to.deep.equal([]);
  });
});
