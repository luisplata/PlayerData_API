/**
 * Reward Entity - Domain Layer
 * Contains business rules for Reward system
 */
class Reward {
  constructor(type, body, level = null, id = null) {
    this.id = id;
    this.type = type;
    this.body = body;
    this.level = level;
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  static validateType(type) {
    const validTypes = ['gold', 'powerup', 'profilePicture', 'profileBackground', 'profileAvatar'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid reward type. Must be one of: ${validTypes.join(', ')}`);
    }
    return true;
  }

  static validateBody(type, body) {
    if (!body || typeof body !== 'object') {
      throw new Error('Reward body must be an object');
    }

    switch (type) {
      case 'gold':
        if (typeof body.amount !== 'number' || body.amount <= 0) {
          throw new Error('Gold reward amount must be a positive number');
        }
        break;
      case 'powerup':
        if (!body.powerup || typeof body.powerup !== 'string') {
          throw new Error('Powerup reward must have a valid powerup name');
        }
        if (typeof body.quantity !== 'number' || body.quantity <= 0) {
          throw new Error('Powerup quantity must be a positive number');
        }
        break;
      case 'profilePicture':
      case 'profileBackground':
      case 'profileAvatar':
        if (typeof body.id !== 'number' || body.id <= 0) {
          throw new Error('Profile item ID must be a positive number');
        }
        break;
    }
    return true;
  }

  static validateLevel(level) {
    if (level !== null && (typeof level !== 'number' || level < 1)) {
      throw new Error('Level must be a positive number or null');
    }
    return true;
  }

  validate() {
    Reward.validateType(this.type);
    Reward.validateBody(this.type, this.body);
    Reward.validateLevel(this.level);
    return true;
  }

  toJSON() {
    return {
      type: this.type,
      body: this.body
    };
  }
}

module.exports = Reward;
