/**
 * PlayerV2 Entity - Domain Layer
 * Enhanced Player entity for API v2 with new features
 */
class PlayerV2 {
  constructor(playerId, nickname, email = null, avatar = null, preferences = {}, id = null) {
    this.id = id;
    this.playerId = playerId;
    this.nickname = nickname;
    this.email = email;
    this.avatar = avatar;
    this.preferences = preferences;
    this.statistics = {
      totalPlayTime: 0,
      gamesPlayed: 0,
      achievements: []
    };
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
    if (nickname.length < 2 || nickname.length > 50) {
      throw new Error('Nickname must be between 2 and 50 characters');
    }
    if (!/^[a-zA-Z0-9._-]+(?: [a-zA-Z0-9._-]+)*$/.test(nickname)) {
      throw new Error('Nickname can only contain letters, numbers, spaces, underscores, hyphens, and dots');
    }
    return true;
  }

  static validateEmail(email) {
    if (email && typeof email !== 'string') {
      throw new Error('Email must be a string');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }
    return true;
  }

  static validateAvatar(avatar) {
    if (avatar && typeof avatar !== 'string') {
      throw new Error('Avatar must be a string');
    }
    if (avatar && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(avatar)) {
      throw new Error('Avatar must be a valid image URL');
    }
    return true;
  }

  static validatePreferences(preferences) {
    if (preferences && typeof preferences !== 'object') {
      throw new Error('Preferences must be an object');
    }
    if (preferences) {
      const validKeys = ['theme', 'language', 'notifications', 'privacy'];
      const invalidKeys = Object.keys(preferences).filter(key => !validKeys.includes(key));
      if (invalidKeys.length > 0) {
        throw new Error(`Invalid preference keys: ${invalidKeys.join(', ')}`);
      }
    }
    return true;
  }

  validate() {
    PlayerV2.validatePlayerId(this.playerId);
    PlayerV2.validateNickname(this.nickname);
    PlayerV2.validateEmail(this.email);
    PlayerV2.validateAvatar(this.avatar);
    PlayerV2.validatePreferences(this.preferences);
    return true;
  }

  updateProfile(updates) {
    if (updates.nickname) {
      PlayerV2.validateNickname(updates.nickname);
      this.nickname = updates.nickname;
    }
    if (updates.email !== undefined) {
      PlayerV2.validateEmail(updates.email);
      this.email = updates.email;
    }
    if (updates.avatar !== undefined) {
      PlayerV2.validateAvatar(updates.avatar);
      this.avatar = updates.avatar;
    }
    if (updates.preferences) {
      PlayerV2.validatePreferences(updates.preferences);
      this.preferences = { ...this.preferences, ...updates.preferences };
    }
    this.updated_at = new Date();
  }

  addAchievement(achievement) {
    if (!this.statistics.achievements.find(a => a.id === achievement.id)) {
      this.statistics.achievements.push({
        ...achievement,
        unlockedAt: new Date()
      });
    }
  }

  updateStatistics(playTime, gamesPlayed) {
    this.statistics.totalPlayTime += playTime;
    this.statistics.gamesPlayed += gamesPlayed;
    this.updated_at = new Date();
  }

  toPublicProfile() {
    return {
      id: this.id,
      playerId: this.playerId,
      nickname: this.nickname,
      avatar: this.avatar,
      statistics: {
        totalPlayTime: this.statistics.totalPlayTime,
        gamesPlayed: this.statistics.gamesPlayed,
        achievementsCount: this.statistics.achievements.length
      },
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  toFullProfile() {
    return {
      id: this.id,
      playerId: this.playerId,
      nickname: this.nickname,
      email: this.email,
      avatar: this.avatar,
      preferences: this.preferences,
      statistics: this.statistics,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = PlayerV2;
