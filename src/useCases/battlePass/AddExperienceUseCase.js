/**
 * AddExperienceUseCase - Use Case Layer
 * Handles battle pass experience addition business logic
 */
const BattlePass = require('../../entities/BattlePass');
const TransactionService = require('../../services/TransactionService');

class AddExperienceUseCase {
  constructor(battlePassRepository, playerRewardRepository, battlePassRewardRepository) {
    this.battlePassRepository = battlePassRepository;
    this.playerRewardRepository = playerRewardRepository;
    this.battlePassRewardRepository = battlePassRewardRepository;
    this.transactionService = new TransactionService();
  }

  async execute(playerId, experience) {
    try {
      // Validate input
      if (!playerId || typeof playerId !== 'string') {
        throw new Error('Player ID is required and must be a string');
      }
      if (typeof experience !== 'number' || experience < 0) {
        throw new Error('Experience must be a non-negative number');
      }

      // Execute all operations in a transaction
      const result = await this.transactionService.executeTransaction(async (trx) => {
        // Get or create battle pass
        let battlePassData = await this.battlePassRepository.findByPlayerId(playerId);
        if (!battlePassData) {
          await this.battlePassRepository.create(playerId);
          battlePassData = await this.battlePassRepository.findByPlayerId(playerId);
        }

        // Create battle pass entity and add experience
        const battlePass = new BattlePass(
          battlePassData.playerId,
          battlePassData.level,
          battlePassData.experience,
          battlePassData.id
        );

        const experienceResult = battlePass.addExperience(experience);

        // Update battle pass in repository
        await this.battlePassRepository.update(playerId, experienceResult.level, experienceResult.experience);

        // Award rewards for new levels if any
        if (experienceResult.levelUp) {
          const levelsGained = experienceResult.level - battlePassData.level;
          for (let i = 1; i <= levelsGained; i++) {
            const newLevel = battlePassData.level + i;
            const reward = await this.battlePassRewardRepository.findByLevel(newLevel);
            if (reward) {
              // Check if player already has this reward
              const existingReward = await this.playerRewardRepository.findByPlayerIdAndLevel(playerId, newLevel);
              if (!existingReward) {
                await this.playerRewardRepository.awardReward(playerId, newLevel);
              }
            }
          }
        }

        // Get current level reward
        let currentReward = await this.battlePassRewardRepository.findByLevel(experienceResult.level);
        let isMaxLevelReward = false;

        // If no reward for current level, get the highest level reward
        if (!currentReward) {
          const allRewards = await this.battlePassRewardRepository.findAll();
          if (allRewards && allRewards.length > 0) {
            const sortedRewards = allRewards.sort((a, b) => b.level - a.level);
            currentReward = sortedRewards[0];
            isMaxLevelReward = true;
          }
        }

        // Parse reward if exists
        let parsedReward = null;
        if (currentReward && currentReward.reward) {
          try {
            parsedReward = JSON.parse(currentReward.reward);
            if (parsedReward && parsedReward.body) {
              parsedReward.body = JSON.stringify(parsedReward.body);
            }
            parsedReward.isMaxLevelReward = isMaxLevelReward;
            parsedReward.rewardLevel = currentReward.level;
          } catch (e) {
            parsedReward = null;
          }
        }

        return {
          ...battlePassData,
          level: experienceResult.level,
          experience: experienceResult.experience,
          reward: parsedReward,
          levelUp: experienceResult.levelUp
        };
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AddExperienceUseCase;
