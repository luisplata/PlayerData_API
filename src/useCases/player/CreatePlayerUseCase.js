/**
 * CreatePlayerUseCase - Use Case Layer
 * Handles player creation business logic
 */
const Player = require('../../entities/Player');
const TransactionService = require('../../services/TransactionService');

class CreatePlayerUseCase {
  constructor(playerRepository, battlePassRepository, playerRewardRepository, battlePassRewardRepository) {
    this.playerRepository = playerRepository;
    this.battlePassRepository = battlePassRepository;
    this.playerRewardRepository = playerRewardRepository;
    this.battlePassRewardRepository = battlePassRewardRepository;
    this.transactionService = new TransactionService();
  }

  async execute(playerId, nickname, apiKey) {
    try {
      // Validate API key
      if (apiKey !== process.env.PLAYER_API_KEY) {
        throw new Error('Unauthorized');
      }

      // Create and validate player entity
      const player = new Player(playerId, nickname);
      player.validate();

      // Check if player already exists
      const existingPlayer = await this.playerRepository.findByPlayerIdOrNickname(playerId, nickname);
      
      if (existingPlayer) {
        // Update existing player's nickname
        if (existingPlayer.nickname !== nickname) {
          await this.playerRepository.updateNickname(playerId, nickname);
          return {
            success: true,
            message: 'Nickname updated successfully',
            player: { ...existingPlayer, nickname }
          };
        }
        return {
          success: true,
          message: 'Player already exists',
          player: existingPlayer
        };
      }

      // Execute player creation and initialization in a transaction
      const result = await this.transactionService.executeTransaction(async (trx) => {
        // Create new player
        const newPlayer = await this.playerRepository.create(player);
        
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
        player: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CreatePlayerUseCase;
