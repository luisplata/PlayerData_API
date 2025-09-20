/**
 * BattlePass Entity - Domain Layer
 * Contains business rules for Battle Pass system
 */
class BattlePass {
  constructor(playerId, level = 1, experience = 0, id = null) {
    this.id = id;
    this.playerId = playerId;
    this.level = level;
    this.experience = experience;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static validatePlayerId(playerId) {
    if (!playerId || typeof playerId !== 'string') {
      throw new Error('Player ID is required and must be a string');
    }
    return true;
  }

  static validateExperience(experience) {
    if (typeof experience !== 'number' || experience < 0) {
      throw new Error('Experience must be a non-negative number');
    }
    if (experience > 10000) {
      throw new Error('Experience cannot exceed 10000');
    }
    return true;
  }

  static validateLevel(level) {
    if (typeof level !== 'number' || level < 1) {
      throw new Error('Level must be a positive number');
    }
    if (level > 100) {
      throw new Error('Level cannot exceed 100');
    }
    return true;
  }

  validate() {
    BattlePass.validatePlayerId(this.playerId);
    BattlePass.validateLevel(this.level);
    BattlePass.validateExperience(this.experience);
    return true;
  }

  addExperience(amount) {
    BattlePass.validateExperience(amount);
    
    let newExperience = this.experience + amount;
    let newLevel = this.level;
    let levelUp = false;

    // Business rule: Level up when experience reaches 100
    while (newExperience >= 100) {
      newLevel += 1;
      newExperience -= 100;
      levelUp = true;
    }

    this.level = newLevel;
    this.experience = newExperience;
    this.updatedAt = new Date();

    return {
      level: this.level,
      experience: this.experience,
      levelUp,
      levelsGained: newLevel - this.level
    };
  }
}

module.exports = BattlePass;
