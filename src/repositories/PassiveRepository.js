/**
 * PassiveRepository - Interface Adapter Layer
 * Handles data persistence for Passive entity.
 */
class PassiveRepository {
  constructor(database) {
    this.db = database;
  }

  async create(passive) {
    try {
      const [id] = await this.db('passives').insert({
        passiveId: passive.passiveId,
        heroId: passive.heroId,
        name: passive.name,
        metadata: JSON.stringify(passive.metadata),
        created_at: passive.created_at,
        updated_at: passive.updated_at
      });

      return {
        id,
        passiveId: passive.passiveId,
        heroId: passive.heroId,
        name: passive.name,
        metadata: passive.metadata
      };
    } catch (error) {
      throw new Error(`Failed to create passive: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.db('passives').orderBy('name', 'asc');
    } catch (error) {
      throw new Error(`Failed to find passives: ${error.message}`);
    }
  }

  async findByPassiveId(passiveId) {
    try {
      return await this.db('passives').where({ passiveId }).first();
    } catch (error) {
      throw new Error(`Failed to find passive by ID: ${error.message}`);
    }
  }

  async findByHeroId(heroId) {
    try {
      return await this.db('passives').where({ heroId }).orderBy('name', 'asc');
    } catch (error) {
      throw new Error(`Failed to find passives by hero: ${error.message}`);
    }
  }
}

module.exports = PassiveRepository;