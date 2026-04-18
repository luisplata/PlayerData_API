/**
 * Dialog Entity - Domain Layer
 * Contains business rules for hero dialogs.
 */
class Dialog {
  constructor(dialogId, heroId, title, metadata = {}, id = null) {
    this.id = id;
    this.dialogId = dialogId;
    this.heroId = heroId;
    this.title = title;
    this.metadata = metadata;
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  static validateDialogId(dialogId) {
    if (!dialogId || typeof dialogId !== 'string') {
      throw new Error('Dialog ID is required and must be a string');
    }
    if (dialogId.length < 3 || dialogId.length > 50) {
      throw new Error('Dialog ID must be between 3 and 50 characters');
    }
    return true;
  }

  static validateHeroId(heroId) {
    if (!heroId || typeof heroId !== 'string') {
      throw new Error('Hero ID is required and must be a string');
    }
    return true;
  }

  static validateTitle(title) {
    if (!title || typeof title !== 'string') {
      throw new Error('Dialog title is required and must be a string');
    }
    if (title.length < 2 || title.length > 120) {
      throw new Error('Dialog title must be between 2 and 120 characters');
    }
    return true;
  }

  static validateMetadata(metadata) {
    if (metadata === null || Array.isArray(metadata) || typeof metadata !== 'object') {
      throw new Error('Dialog metadata must be an object');
    }
    return true;
  }

  validate() {
    Dialog.validateDialogId(this.dialogId);
    Dialog.validateHeroId(this.heroId);
    Dialog.validateTitle(this.title);
    Dialog.validateMetadata(this.metadata);
    return true;
  }
}

module.exports = Dialog;