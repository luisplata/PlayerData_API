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

      const normalizedHeroes = heroes.map(hero => {
        const base = {
          id: hero.id,
          heroId: hero.heroId,
          name: hero.name,
          metadata: this.parseMetadata(hero.metadata),
          created_at: hero.created_at,
          updated_at: hero.updated_at
        };

        // attach passive info if present (informative only)
        if (hero.passive_passiveId) {
          base.passive = {
            passiveId: hero.passive_passiveId,
            name: hero.passive_name,
            metadata: this.parseMetadata(hero.passive_metadata)
          };
        } else {
          base.passive = null;
        }

        return base;
      });

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
