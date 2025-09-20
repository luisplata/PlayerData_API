/**
 * BattlePassRepository - Interface Adapter Layer
 * Handles data persistence for BattlePass entity
 */
class BattlePassRepository {
  constructor(database) {
    this.db = database;
  }

  async create(playerId) {
    try {
      // Verify player exists
      const playerExists = await this.db('players').where({ playerId }).first();
      if (!playerExists) {
        throw new Error('Player ID does not exist');
      }

      const [id] = await this.db('battle_passes').insert({
        playerId,
        level: 1,
        experience: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        id,
        playerId,
        level: 1,
        experience: 0
      };
    } catch (error) {
      throw new Error(`Failed to create battle pass: ${error.message}`);
    }
  }

  async findByPlayerId(playerId) {
    try {
      return await this.db('battle_passes').where({ playerId }).first();
    } catch (error) {
      throw new Error(`Failed to find battle pass: ${error.message}`);
    }
  }

  async update(playerId, level, experience) {
    try {
      const updatedRows = await this.db('battle_passes')
        .where({ playerId })
        .update({ 
          level,
          experience,
          updatedAt: new Date()
        });
      
      if (updatedRows === 0) {
        throw new Error('Battle pass not found');
      }
      
      return updatedRows;
    } catch (error) {
      throw new Error(`Failed to update battle pass: ${error.message}`);
    }
  }

  async ensureExists(playerId) {
    try {
      let battlePass = await this.findByPlayerId(playerId);
      if (!battlePass) {
        await this.create(playerId);
        battlePass = await this.findByPlayerId(playerId);
      }
      return battlePass;
    } catch (error) {
      throw new Error(`Failed to ensure battle pass exists: ${error.message}`);
    }
  }
}

module.exports = BattlePassRepository;
