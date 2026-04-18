/**
 * HeroController - Interface Adapter Layer
 * Handles HTTP requests for Hero operations.
 */
const CreateHeroUseCase = require('../useCases/heroes/CreateHeroUseCase');
const GetHeroListUseCase = require('../useCases/heroes/GetHeroListUseCase');
const ErrorHandlerMiddleware = require('../middlewares/ErrorHandlerMiddleware');

class HeroController {
  constructor(heroRepository) {
    this.createHeroUseCase = new CreateHeroUseCase(heroRepository);
    this.getHeroListUseCase = new GetHeroListUseCase(heroRepository);
  }

  createHero = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { heroId, name, metadata } = req.body;

    const result = await this.createHeroUseCase.execute(heroId, name, metadata);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: result.error,
          statusCode: 400
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Hero created successfully',
      data: result.hero
    });
  });

  getHeroList = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const result = await this.getHeroListUseCase.execute();
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: {
          message: result.error,
          statusCode: 500
        }
      });
    }

    res.json({
      success: true,
      data: {
        heroes: result.heroes
      }
    });
  });
}

module.exports = HeroController;