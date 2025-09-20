/**
 * CreatePlayerV2UseCase - Use Case Layer
 * Enhanced player creation for API v2 with new fields
 */
const PlayerV2 = require('../../entities/v2/PlayerV2');
const TransactionService = require('../../services/TransactionService');

class CreatePlayerV2UseCase {
  constructor(playerRepository, battlePassRepository, playerRewardRepository, battlePassRewardRepository) {
    this.playerRepository = playerRepository;
    this.battlePassRepository = battlePassRepository;
    this.playerRewardRepository = playerRewardRepository;
    this.battlePassRewardRepository = battlePassRewardRepository;
    this.transactionService = new TransactionService();
  }

  async execute(playerId, nickname, email, avatar, preferences, apiKey) {
    try {
      // Validate API key
      if (apiKey !== process.env.PLAYER_API_KEY) {
        throw new Error('Unauthorized');
      }

      // Create and validate player entity
      const player = new PlayerV2(playerId, nickname, email, avatar, preferences);
      player.validate();

      // Check if player already exists
      const existingPlayer = await this.playerRepository.findByPlayerIdOrNickname(playerId, nickname);
      
      if (existingPlayer) {
        // Update existing player's profile
        if (existingPlayer.nickname !== nickname || 
            existingPlayer.email !== email || 
            existingPlayer.avatar !== avatar ||
            JSON.stringify(existingPlayer.preferences) !== JSON.stringify(preferences)) {
          
          await this.playerRepository.updateProfile(playerId, {
            nickname,
            email,
            avatar,
            preferences
          });
          
          return {
            success: true,
            message: 'Player profile updated successfully',
            data: {
              player: { ...existingPlayer, nickname, email, avatar, preferences },
              action: 'updated'
            }
          };
        }
        
        return {
          success: true,
          message: 'Player already exists',
          data: {
            player: existingPlayer,
            action: 'existing'
          }
        };
      }

      // Execute player creation and initialization in a transaction
      const result = await this.transactionService.executeTransaction(async (trx) => {
        // Create new player
        const newPlayer = await this.playerRepository.createV2(player);
        
        // Initialize battle pass for new player
        await this.battlePassRepository.create(playerId);
        
        // Award level 1 reward if it exists
        const level1Reward = await this.battlePassRewardRepository.findByLevel(1);
        if (level1Reward) {
          await this.playerRewardRepository.awardReward(playerId, 1);
        }
        
        return newPlayer;
      });

      return {
        success: true,
        message: 'Player created successfully',
        data: {
          player: result,
          action: 'created'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CreatePlayerV2UseCase;
