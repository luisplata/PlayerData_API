/**
 * BattlePassController - Interface Adapter Layer
 * Handles HTTP requests for BattlePass operations
 */
const AddExperienceUseCase = require('../useCases/battlePass/AddExperienceUseCase');
const ErrorHandlerMiddleware = require('../middlewares/ErrorHandlerMiddleware');

class BattlePassController {
  constructor(battlePassRepository, playerRewardRepository, battlePassRewardRepository) {
    this.addExperienceUseCase = new AddExperienceUseCase(
      battlePassRepository,
      playerRewardRepository,
      battlePassRewardRepository
    );
    this.battlePassRepository = battlePassRepository;
    this.playerRewardRepository = playerRewardRepository;
  }

  getBattlePassByPlayerId = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { playerId } = req.params;
    
    try {
      const battlePass = await this.battlePassRepository.findByPlayerId(playerId);
      if (!battlePass) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Battle pass not found for player',
            statusCode: 404
          }
        });
      }
      
      // Get player rewards
      const rewards = await this.playerRewardRepository.findByPlayerId(playerId);
      
      res.json({
        success: true,
        data: {
          battlePass,
          rewards
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Error while getting battle pass',
          statusCode: 500
        }
      });
    }
  });

  addExperience = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { playerId, experience } = req.body;
    
    const result = await this.addExperienceUseCase.execute(playerId, experience);
    
    if (!result.success) {
      const statusCode = result.error.includes('required') || result.error.includes('must be') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        error: {
          message: result.error,
          statusCode
        }
      });
    }
    
    res.json({
      success: true,
      data: result.data
    });
  });
}

module.exports = BattlePassController;
