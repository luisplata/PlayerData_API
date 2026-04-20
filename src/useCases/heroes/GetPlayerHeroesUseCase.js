/**
 * GetPlayerHeroesUseCase - Use Case Layer
 * Returns full hero catalog merged with player-specific level progress.
 */
class GetPlayerHeroesUseCase {
  constructor(heroRepository) {
    this.heroRepository = heroRepository;
    this.progressionMetadataDefaults = {
      pointsLostPerGame: 0,
      minPointsGainedPerConversation: 0,
      pointsGainedPerConversationComplete: 0
    };
    this.progressionMetadataKeys = [
      'xpPerLevel',
      'pointsLostPerGame',
      'minPointsGainedPerConversation',
      'pointsGainedPerConversationComplete'
    ];
  }

  parseMetadata(metadata) {
    if (!metadata) {
      return {};
    }

    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata);
      } catch (error) {
        return {};
      }
    }

    return metadata;
  }

  hasAnyProgressionMetadata(metadata) {
    return this.progressionMetadataKeys.some(key =>
      Object.prototype.hasOwnProperty.call(metadata, key)
    );
  }

  normalizeMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return {};
    }

    if (!this.hasAnyProgressionMetadata(metadata)) {
      return metadata;
    }

    return {
      ...this.progressionMetadataDefaults,
      ...metadata
    };
  }

  normalizeLevel(level) {
    return Number.isInteger(level) && level >= 0 ? level : 0;
  }

  normalizeCurrentXp(currentXp) {
    return Number.isInteger(currentXp) && currentXp >= 0 ? currentXp : 0;
  }

  normalizeXpPerLevel(metadata) {
    return Number.isInteger(metadata.xpPerLevel) && metadata.xpPerLevel > 0
      ? metadata.xpPerLevel
      : 0;
  }

  calculateProgress(currentXp, xpPerLevel) {
    if (xpPerLevel <= 0) {
      return {
        xpToNextLevel: 0,
        progressPct: 0
      };
    }

    const clampedCurrentXp = Math.min(currentXp, xpPerLevel);
    return {
      xpToNextLevel: Math.max(xpPerLevel - clampedCurrentXp, 0),
      progressPct: Math.round((clampedCurrentXp / xpPerLevel) * 100)
    };
  }

  async execute(playerId) {
    try {
      const heroes =
        await this.heroRepository.getAllWithPlayerProgress(playerId);
      const normalizedHeroes = heroes.map(hero => ({
        ...hero,
        metadata: this.normalizeMetadata(this.parseMetadata(hero.metadata)),
        level: this.normalizeLevel(hero.level),
        currentXp: this.normalizeCurrentXp(hero.currentXp)
      }));

      const heroesWithProgress = normalizedHeroes.map(hero => {
        const xpPerLevel = this.normalizeXpPerLevel(hero.metadata);
        const progress = this.calculateProgress(hero.currentXp, xpPerLevel);

        return {
          ...hero,
          ...progress
        };
      });

      return {
        success: true,
        heroes: heroesWithProgress
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = GetPlayerHeroesUseCase;
