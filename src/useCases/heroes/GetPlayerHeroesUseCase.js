/**
 * GetPlayerHeroesUseCase - Use Case Layer
 * Returns full hero catalog merged with player-specific level progress.
 */
class GetPlayerHeroesUseCase {
  constructor(heroRepository) {
    this.heroRepository = heroRepository;
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

  normalizeLevel(level) {
    return Number.isInteger(level) && level >= 0 ? level : 0;
  }

  async execute(playerId) {
    try {
      const heroes = await this.heroRepository.getAllWithPlayerProgress(playerId);
      const normalizedHeroes = heroes.map((hero) => ({
        ...hero,
        metadata: this.parseMetadata(hero.metadata),
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