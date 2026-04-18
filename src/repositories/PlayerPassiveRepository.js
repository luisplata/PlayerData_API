/**
 * PlayerPassiveRepository - Interface Adapter Layer
 * Handles data persistence for player passive assignments.
 */
class PlayerPassiveRepository {
  constructor(database) {
    this.db = database;
  }

  async assignPassive(playerId, heroId, passiveId) {
    try {
      const existing = await this.db('player_passives')
        .where({ playerId, heroId, passiveId })
        .first();

      if (existing) {
        return existing;
      }

      const [id] = await this.db('player_passives').insert({
        playerId,
        heroId,
        passiveId,
        assigned_at: new Date()
      });

      return {
        id,
        playerId,
        heroId,
        passiveId
      };
    } catch (error) {
      throw new Error(`Failed to assign passive: ${error.message}`);
    }
  }

  async getByPlayerId(playerId) {
    try {
      return await this.db('player_passives').where({ playerId }).orderBy('assigned_at', 'desc');
    } catch (error) {
      throw new Error(`Failed to find player passives: ${error.message}`);
    }
  }

  async getByPlayerAndHero(playerId, heroId) {
    try {
      return await this.db('player_passives').where({ playerId, heroId }).first();
    } catch (error) {
      throw new Error(`Failed to find player passive by hero: ${error.message}`);
    }
  }
}

module.exports = PlayerPassiveRepository;