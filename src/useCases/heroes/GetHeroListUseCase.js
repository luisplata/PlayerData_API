/**
 * GetHeroListUseCase - Use Case Layer
 * Returns hero catalog with normalized metadata values.
 */
class GetHeroListUseCase {
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

  async execute() {
    try {
      const heroes = await this.heroRepository.findAll();
      const normalizedHeroes = heroes.map((hero) => ({
        ...hero,
        metadata: this.parseMetadata(hero.metadata)
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

module.exports = GetHeroListUseCase;