/**
 * GetPassiveUseCase - Use Case Layer
 * Returns player passive state and passive catalog.
 */
class GetPassiveUseCase {
  constructor(playerPassiveRepository, passiveRepository) {
    this.playerPassiveRepository = playerPassiveRepository;
    this.passiveRepository = passiveRepository;
  }

  async execute(playerId) {
    try {
      const assignedList = await this.playerPassiveRepository.getByPlayerId(playerId);
      const catalog = await this.passiveRepository.findAll();

      return {
        success: true,
        assignedPassive: assignedList.length > 0 ? assignedList[0] : null,
        catalog
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = GetPassiveUseCase;