/**
 * Passive Entity - Domain Layer
 * Contains business rules for passive metadata.
 */
class Passive {
  constructor(passiveId, name, heroId, metadata = {}, id = null) {
    this.id = id;
    this.passiveId = passiveId;
    this.name = name;
    this.heroId = heroId;
    this.metadata = metadata;
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  static validatePassiveId(passiveId) {
    if (!passiveId || typeof passiveId !== 'string') {
      throw new Error('Passive ID is required and must be a string');
    }
    if (passiveId.length < 3 || passiveId.length > 50) {
      throw new Error('Passive ID must be between 3 and 50 characters');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(passiveId)) {
      throw new Error(
        'Passive ID can only contain letters, numbers, underscores, and hyphens'
      );
    }
    return true;
  }

  static validateName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Passive name is required and must be a string');
    }
    if (name.length < 2 || name.length > 80) {
      throw new Error('Passive name must be between 2 and 80 characters');
    }
    return true;
  }

  static validateHeroId(heroId) {
    if (!heroId || typeof heroId !== 'string') {
      throw new Error('Hero ID is required and must be a string');
    }
    return true;
  }

  static validateMetadata(metadata) {
    if (
      metadata === null ||
      Array.isArray(metadata) ||
      typeof metadata !== 'object'
    ) {
      throw new Error('Passive metadata must be an object');
    }
    return true;
  }

  validate() {
    Passive.validatePassiveId(this.passiveId);
    Passive.validateName(this.name);
    Passive.validateHeroId(this.heroId);
    Passive.validateMetadata(this.metadata);
    return true;
  }
}

module.exports = Passive;
