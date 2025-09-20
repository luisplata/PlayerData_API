/**
 * Player Entity - Domain Layer
 * Contains business rules and validation for Player
 */
class Player {
  constructor(playerId, nickname, id = null) {
    this.id = id;
    this.playerId = playerId;
    this.nickname = nickname;
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  static validatePlayerId(playerId) {
    if (!playerId || typeof playerId !== 'string') {
      throw new Error('Player ID is required and must be a string');
    }
    if (playerId.length < 3 || playerId.length > 50) {
      throw new Error('Player ID must be between 3 and 50 characters');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(playerId)) {
      throw new Error('Player ID can only contain letters, numbers, underscores, and hyphens');
    }
    return true;
  }

  static validateNickname(nickname) {
    if (!nickname || typeof nickname !== 'string') {
      throw new Error('Nickname is required and must be a string');
    }
    if (nickname.length < 2 || nickname.length > 30) {
      throw new Error('Nickname must be between 2 and 30 characters');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(nickname)) {
      throw new Error('Nickname can only contain letters, numbers, underscores, and hyphens');
    }
    return true;
  }

  validate() {
    Player.validatePlayerId(this.playerId);
    Player.validateNickname(this.nickname);
    return true;
  }

  updateNickname(newNickname) {
    Player.validateNickname(newNickname);
    this.nickname = newNickname;
    this.updated_at = new Date();
  }
}

module.exports = Player;
