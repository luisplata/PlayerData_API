/**
 * PlayerRepository - Interface Adapter Layer
 * Handles data persistence for Player entity
 */
class PlayerRepository {
  constructor(database) {
    this.db = database;
  }

  async create(player) {
    try {
      const [id] = await this.db('players').insert({
        playerId: player.playerId,
        nickname: player.nickname,
        created_at: player.created_at,
        updated_at: player.updated_at
      });
      
      return {
        id,
        playerId: player.playerId,
        nickname: player.nickname,
        created_at: player.created_at,
        updated_at: player.updated_at
      };
    } catch (error) {
      throw new Error(`Failed to create player: ${error.message}`);
    }
  }

  async findByPlayerId(playerId) {
    try {
      return await this.db('players').where({ playerId }).first();
    } catch (error) {
      throw new Error(`Failed to find player by ID: ${error.message}`);
    }
  }

  async findByNickname(nickname) {
    try {
      return await this.db('players').where({ nickname }).first();
    } catch (error) {
      throw new Error(`Failed to find player by nickname: ${error.message}`);
    }
  }

  async findByPlayerIdOrNickname(playerId, nickname) {
    try {
      return await this.db('players')
        .where({ playerId })
        .orWhere({ nickname })
        .first();
    } catch (error) {
      throw new Error(`Failed to find player: ${error.message}`);
    }
  }

  async updateNickname(playerId, nickname) {
    try {
      const updatedRows = await this.db('players')
        .where({ playerId })
        .update({ 
          nickname,
          updatedAt: new Date()
        });
      
      return updatedRows;
    } catch (error) {
      throw new Error(`Failed to update player nickname: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await this.db('players').where({ id }).first();
    } catch (error) {
      throw new Error(`Failed to find player by ID: ${error.message}`);
    }
  }

  async isNicknameAvailable(nickname) {
    try {
      const player = await this.findByNickname(nickname);
      return !player;
    } catch (error) {
      throw new Error(`Failed to check nickname availability: ${error.message}`);
    }
  }
}

module.exports = PlayerRepository;
