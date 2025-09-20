/**
 * LoginPlayerUseCase - Use Case Layer
 * Handles player authentication business logic
 */
class LoginPlayerUseCase {
  constructor(playerRepository, jwtService) {
    this.playerRepository = playerRepository;
    this.jwtService = jwtService;
  }

  async execute(playerId) {
    try {
      // Validate input
      if (!playerId || typeof playerId !== 'string') {
        throw new Error('Player ID is required and must be a string');
      }

      // Check if player exists
      const player = await this.playerRepository.findByPlayerId(playerId);
      if (!player) {
        throw new Error('Invalid player ID');
      }

      // Generate JWT token
      const token = this.jwtService.generateToken({ playerId });

      return {
        success: true,
        token,
        player: {
          id: player.id,
          playerId: player.playerId,
          nickname: player.nickname
        }
      };
    } catch (error) {
      console.error('Error in LoginPlayerUseCase:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = LoginPlayerUseCase;
