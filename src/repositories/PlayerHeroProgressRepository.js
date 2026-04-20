/**
 * PlayerHeroProgressRepository - Interface Adapter Layer
 * Handles persistence for player-hero level progress.
 */
class PlayerHeroProgressRepository {
  constructor(database) {
    this.db = database;
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
          created_at: new Date(),
          updated_at: new Date()
        });

        return {
          id,
          playerId,
          heroId,
          level: 1
        };
      }

      const nextLevel = current.level + 1;
      await this.db('player_hero_progress')
        .where({ playerId, heroId })
        .update({ level: nextLevel, updated_at: new Date() });

      return {
        ...current,
        level: nextLevel
      };
    } catch (error) {
      throw new Error(`Failed to increment player hero level: ${error.message}`);
    }
  }
}

module.exports = PlayerHeroProgressRepository;