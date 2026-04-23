/**
 * PlayerHeroProgressRepository - Interface Adapter Layer
 * Handles persistence for player-hero level progress.
 */
class PlayerHeroProgressRepository {
  constructor(database) {
    this.db = database;
  }

  static normalizePositiveInteger(value, fallback = 0) {
    return Number.isInteger(value) && value >= 0 ? value : fallback;
  }

  async getByPlayerAndHero(playerId, heroId) {
    try {
      return await this.db('player_hero_progress').where({ playerId, heroId }).first();
    } catch (error) {
      throw new Error(`Failed to find player hero progress: ${error.message}`);
    }
  }

  async incrementLevel(playerId, heroId) {
    try {
      const current = await this.getByPlayerAndHero(playerId, heroId);

      if (!current) {
        const [id] = await this.db('player_hero_progress').insert({
          playerId,
          heroId,
          level: 1,
          currentXp: 0,
          created_at: new Date(),
          updated_at: new Date()
        });

        return {
          id,
          playerId,
          heroId,
          level: 1,
          currentXp: 0
        };
      }

      const nextLevel = current.level + 1;
      await this.db('player_hero_progress')
        .where({ playerId, heroId })
        .update({ level: nextLevel, currentXp: 0, updated_at: new Date() });

      return {
        ...current,
        level: nextLevel,
        currentXp: 0
      };
    } catch (error) {
      throw new Error(`Failed to increment player hero level: ${error.message}`);
    }
  }

  async addExperience(playerId, heroId, experienceGain, xpPerLevel) {
    try {
      if (!Number.isInteger(experienceGain) || experienceGain < 0) {
        throw new Error('Experience gain must be a non-negative integer');
      }

      if (!Number.isInteger(xpPerLevel) || xpPerLevel <= 0) {
        throw new Error('XP per level must be a positive integer');
      }

      const current = await this.getByPlayerAndHero(playerId, heroId);
      const currentLevel = PlayerHeroProgressRepository.normalizePositiveInteger(current && current.level, 0);
      const currentXp = PlayerHeroProgressRepository.normalizePositiveInteger(current && current.currentXp, 0);
      const totalXp = currentXp + experienceGain;
      const levelsGained = Math.floor(totalXp / xpPerLevel);
      const nextLevel = currentLevel + levelsGained;
      const nextCurrentXp = totalXp % xpPerLevel;

      if (!current) {
        const [id] = await this.db('player_hero_progress').insert({
          playerId,
          heroId,
          level: nextLevel,
          currentXp: nextCurrentXp,
          created_at: new Date(),
          updated_at: new Date()
        });

        return {
          id,
          playerId,
          heroId,
          level: nextLevel,
          currentXp: nextCurrentXp,
          levelsGained
        };
      }

      await this.db('player_hero_progress')
        .where({ playerId, heroId })
        .update({ level: nextLevel, currentXp: nextCurrentXp, updated_at: new Date() });

      return {
        ...current,
        level: nextLevel,
        currentXp: nextCurrentXp,
        levelsGained
      };
    } catch (error) {
      throw new Error(`Failed to add hero experience: ${error.message}`);
    }
  }
}

module.exports = PlayerHeroProgressRepository;