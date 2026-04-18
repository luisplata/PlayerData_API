const Hero = require('../../entities/Hero');

/**
 * CreateHeroUseCase - Use Case Layer
 * Handles hero creation business logic.
 */
class CreateHeroUseCase {
  constructor(heroRepository) {
    this.heroRepository = heroRepository;
  }

  async execute(heroId, name, metadata = {}) {
    try {
      const hero = new Hero(heroId, name, metadata);
      hero.validate();

      const createdHero = await this.heroRepository.create(hero);

      return {
        success: true,
        hero: createdHero
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CreateHeroUseCase;