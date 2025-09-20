/**
 * BattlePassRewardRepository - Interface Adapter Layer
 * Handles data persistence for BattlePassReward entity
 */
class BattlePassRewardRepository {
  constructor(database) {
    this.db = database;
  }

  async create(reward) {
    try {
      const [id] = await this.db('battle_pass_rewards').insert({
        level: reward.level,
        reward: JSON.stringify(reward.toJSON()),
        created_at: new Date(),
        updated_at: new Date()
      });

      return {
        id,
        level: reward.level,
        reward: reward.toJSON()
      };
    } catch (error) {
      throw new Error(`Failed to create battle pass reward: ${error.message}`);
    }
  }

  async findByLevel(level) {
    try {
      return await this.db('battle_pass_rewards').where({ level }).first();
    } catch (error) {
      throw new Error(`Failed to find reward by level: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.db('battle_pass_rewards').orderBy('level', 'asc');
    } catch (error) {
      throw new Error(`Failed to find all rewards: ${error.message}`);
    }
  }

  async update(id, reward) {
    try {
      const updatedRows = await this.db('battle_pass_rewards')
        .where({ id })
        .update({
          reward: JSON.stringify(reward.toJSON()),
          updatedAt: new Date()
        });

      if (updatedRows === 0) {
        throw new Error('Reward not found');
      }

      return updatedRows;
    } catch (error) {
      throw new Error(`Failed to update reward: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const deletedRows = await this.db('battle_pass_rewards').where({ id }).del();
      
      if (deletedRows === 0) {
        throw new Error('Reward not found');
      }

      return deletedRows;
    } catch (error) {
      throw new Error(`Failed to delete reward: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await this.db('battle_pass_rewards').where({ id }).first();
    } catch (error) {
      throw new Error(`Failed to find reward by ID: ${error.message}`);
    }
  }
}

module.exports = BattlePassRewardRepository;
