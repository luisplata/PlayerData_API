/**
 * Hero Entity - Domain Layer
 * Contains business rules and validation for Hero metadata.
 */
class Hero {
  constructor(heroId, name, metadata = {}, id = null) {
    this.id = id;
    this.heroId = heroId;
    this.name = name;
    this.metadata = metadata;
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  static validateHeroId(heroId) {
    if (!heroId || typeof heroId !== 'string') {
      throw new Error('Hero ID is required and must be a string');
    }
    if (heroId.length < 3 || heroId.length > 50) {
      throw new Error('Hero ID must be between 3 and 50 characters');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(heroId)) {
      throw new Error(
        'Hero ID can only contain letters, numbers, underscores, and hyphens'
      );
    }
    return true;
  }

  static validateName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Hero name is required and must be a string');
    }
    if (name.length < 2 || name.length > 80) {
      throw new Error('Hero name must be between 2 and 80 characters');
    }
    return true;
  }

  static validateMetadata(metadata) {
    if (
      metadata === null ||
      Array.isArray(metadata) ||
      typeof metadata !== 'object'
    ) {
      throw new Error('Hero metadata must be an object');
    }

    Hero.validateProgressionMetadata(metadata);
    return true;
  }

  static hasOwn(metadata, key) {
    return Object.prototype.hasOwnProperty.call(metadata, key);
  }

  static validateNonNegativeIntegerField(metadata, fieldName) {
    if (!Hero.hasOwn(metadata, fieldName)) {
      return;
    }

    const value = metadata[fieldName];
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`${fieldName} must be a non-negative integer`);
    }
  }

  static validateProgressionMetadata(metadata) {
    if (Hero.hasOwn(metadata, 'xpPerLevel')) {
      const xpPerLevel = metadata.xpPerLevel;
      if (!Number.isInteger(xpPerLevel) || xpPerLevel <= 0) {
        throw new Error('xpPerLevel must be a positive integer');
      }
    }

    Hero.validateNonNegativeIntegerField(metadata, 'pointsLostPerGame');
    Hero.validateNonNegativeIntegerField(
      metadata,
      'minPointsGainedPerConversation'
    );
    Hero.validateNonNegativeIntegerField(
      metadata,
      'pointsGainedPerConversationComplete'
    );

    if (
      Hero.hasOwn(metadata, 'minPointsGainedPerConversation') &&
      Hero.hasOwn(metadata, 'pointsGainedPerConversationComplete') &&
      metadata.pointsGainedPerConversationComplete <
        metadata.minPointsGainedPerConversation
    ) {
      throw new Error(
        'pointsGainedPerConversationComplete must be greater than or equal to minPointsGainedPerConversation'
      );
    }
  }

  validate() {
    Hero.validateHeroId(this.heroId);
    Hero.validateName(this.name);
    Hero.validateMetadata(this.metadata);
    return true;
  }
}

module.exports = Hero;
