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
    return this.progressionMetadataKeys.some((key) => Object.prototype.hasOwnProperty.call(metadata, key));
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

  async execute(playerId) {
    try {
      const heroes = await this.heroRepository.getAllWithPlayerProgress(playerId);
      const normalizedHeroes = heroes.map((hero) => ({
        ...hero,
        metadata: this.normalizeMetadata(this.parseMetadata(hero.metadata)),
        level: this.normalizeLevel(hero.level)
      }));

      return {
        success: true,
        heroes: normalizedHeroes
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