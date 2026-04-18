/**
 * HeroRepository - Interface Adapter Layer
 * Handles data persistence for Hero entity.
 */
class HeroRepository {
  constructor(database) {
    this.db = database;
  }

  async create(hero) {
    try {
      const [id] = await this.db('heroes').insert({
        heroId: hero.heroId,
        name: hero.name,
        metadata: JSON.stringify(hero.metadata),
        created_at: hero.created_at,
        updated_at: hero.updated_at
      });

      return {
        id,
        heroId: hero.heroId,
        name: hero.name,
        metadata: hero.metadata,
        created_at: hero.created_at,
        updated_at: hero.updated_at
      };
    } catch (error) {
      throw new Error(`Failed to create hero: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.db('heroes').orderBy('name', 'asc');
    } catch (error) {
      throw new Error(`Failed to find heroes: ${error.message}`);
    }
  }

  async findByHeroId(heroId) {
    try {
      return await this.db('heroes').where({ heroId }).first();
    } catch (error) {
      throw new Error(`Failed to find hero by ID: ${error.message}`);
    }
  }
}

module.exports = HeroRepository;