/**
 * PlayerRewardRepository - Interface Adapter Layer
 * Handles data persistence for PlayerReward entity
 */
class PlayerRewardRepository {
  constructor(database) {
    this.db = database;
  }

  async awardReward(playerId, level) {
    try {
      // Get the reward for the level
      const reward = await this.db('battle_pass_rewards').where({ level }).first();
      if (!reward) {
        throw new Error(`No reward found for level ${level}`);
      }

      // Check if player already has this reward
      const existingReward = await this.findByPlayerIdAndLevel(playerId, level);
      if (existingReward) {
        throw new Error('Reward already awarded to player');
      }

      const [id] = await this.db('player_rewards').insert({
        playerId,
        rewardId: reward.id,
        claimed: false,
        awarded_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      });

      return {
        id,
        playerId,
        rewardId: reward.id,
        level,
        claimed: false,
        awarded_at: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to award reward: ${error.message}`);
    }
  }

  async findByPlayerId(playerId) {
    try {
      const rewards = await this.db('player_rewards as pr')
        .leftJoin('battle_pass_rewards as bpr', 'pr.rewardId', 'bpr.id')
        .where('pr.playerId', playerId)
        .select(
          'pr.id',
          'pr.playerId',
          'pr.rewardId',
          'pr.claimed',
          'pr.awarded_at',
          'bpr.level as level',
          'bpr.reward as reward'
        );

      return rewards.map(r => {
        let parsed = null;
        try {
          parsed = r.reward ? JSON.parse(r.reward) : null;
          if (parsed && parsed.body) {
            parsed.body = JSON.stringify(parsed.body);
          }
        } catch (e) {
          parsed = null;
        }
        return { ...r, reward: parsed };
      });
    } catch (error) {
      throw new Error(`Failed to find player rewards: ${error.message}`);
    }
  }

  async findByPlayerIdAndLevel(playerId, level) {
    try {
      return await this.db('player_rewards as pr')
        .leftJoin('battle_pass_rewards as bpr', 'pr.rewardId', 'bpr.id')
        .where('pr.playerId', playerId)
        .andWhere('bpr.level', level)
        .first();
    } catch (error) {
      throw new Error(`Failed to find player reward by level: ${error.message}`);
    }
  }

  async findUnclaimedByPlayerId(playerId) {
    try {
      const rewards = await this.db('player_rewards as pr')
        .leftJoin('battle_pass_rewards as bpr', 'pr.rewardId', 'bpr.id')
        .where('pr.playerId', playerId)
        .andWhere('pr.claimed', false)
        .select(
          'pr.id',
          'pr.playerId',
          'pr.rewardId',
          'pr.claimed',
          'pr.awarded_at',
          'bpr.level as level',
          'bpr.reward as reward'
        );

      return rewards.map(r => {
        let parsed = null;
        try {
          parsed = r.reward ? JSON.parse(r.reward) : null;
          if (parsed && parsed.body) {
            parsed.body = JSON.stringify(parsed.body);
          }
        } catch (e) {
          parsed = null;
        }
        return { ...r, reward: parsed };
      });
    } catch (error) {
      throw new Error(`Failed to find unclaimed rewards: ${error.message}`);
    }
  }

  async claimReward(playerId, level) {
    try {
      const reward = await this.findByPlayerIdAndLevel(playerId, level);
      if (!reward) {
        throw new Error('Reward not found for player');
      }
      if (reward.claimed) {
        throw new Error('Reward already claimed');
      }

      const updatedRows = await this.db('player_rewards')
        .where('id', reward.id)
        .update({
          claimed: true,
          updated_at: new Date()
        });

      if (updatedRows === 0) {
        throw new Error('Failed to claim reward');
      }

      return {
        success: true,
        message: 'Reward claimed successfully'
      };
    } catch (error) {
      throw new Error(`Failed to claim reward: ${error.message}`);
    }
  }
}

module.exports = PlayerRewardRepository;
