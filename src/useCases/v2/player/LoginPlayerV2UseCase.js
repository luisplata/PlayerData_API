/**
 * LoginPlayerV2UseCase - Use Case Layer
 * Enhanced player authentication for API v2 with refresh tokens
 */
class LoginPlayerV2UseCase {
  constructor(playerRepository, authServiceV2) {
    this.playerRepository = playerRepository;
    this.authServiceV2 = authServiceV2;
  }

  async execute(playerId, email = null) {
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

      // If email is provided, validate it matches the player's email
      if (email && player.email && player.email !== email) {
        throw new Error('Email does not match player record');
      }

      // Generate session ID for tracking
      const sessionId = this.authServiceV2.generateSessionId();

      // Generate token pair (access + refresh)
      const tokens = this.authServiceV2.generateTokenPair({
        playerId,
        sessionId,
        email: player.email
      });

      // Update player's last login
      await this.playerRepository.updateLastLogin(playerId);

      return {
        success: true,
        data: {
          player: {
            id: player.id,
            playerId: player.playerId,
            nickname: player.nickname,
            email: player.email,
            avatar: player.avatar,
            preferences: player.preferences,
            statistics: player.statistics
          },
          authentication: {
            ...tokens,
            sessionId
          }
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

module.exports = LoginPlayerV2UseCase;
