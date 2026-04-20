/**
 * HeroController - Interface Adapter Layer
 * Handles HTTP requests for Hero operations.
 * @swagger
 * tags:
 *   name: Heroes
 *   description: Hero catalog and passive/dialog interaction operations
 */
const CreateHeroUseCase = require('../useCases/heroes/CreateHeroUseCase');
const GetHeroListUseCase = require('../useCases/heroes/GetHeroListUseCase');
const GetPlayerHeroesUseCase = require('../useCases/heroes/GetPlayerHeroesUseCase');
const ErrorHandlerMiddleware = require('../middlewares/ErrorHandlerMiddleware');

class HeroController {
  constructor(heroRepository) {
    this.createHeroUseCase = new CreateHeroUseCase(heroRepository);
    this.getHeroListUseCase = new GetHeroListUseCase(heroRepository);
    this.getPlayerHeroesUseCase = new GetPlayerHeroesUseCase(heroRepository);
  }

  /**
   * @swagger
   * /api/v1/heroes:
   *   post:
   *     summary: Create a new hero
   *     tags: [Heroes]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - heroId
   *               - name
   *             properties:
   *               heroId:
   *                 type: string
   *                 example: hero_001
   *               name:
   *                 type: string
   *                 example: Astra
   *               metadata:
   *                 type: object
   *                 additionalProperties: true
   *                 example:
   *                   role: support
  *                   xpPerLevel: 100
  *                   pointsLostPerGame: 2
  *                   minPointsGainedPerConversation: 1
  *                   pointsGainedPerConversationComplete: 10
   *     responses:
   *       201:
   *         description: Hero created successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Hero'
   *       400:
   *         description: Validation error for request payload
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Missing or invalid bearer token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/v1/heroes:
   *   get:
   *     summary: Get hero catalog
   *     tags: [Heroes]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Hero list returned successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         heroes:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/Hero'
   *       401:
   *         description: Missing or invalid bearer token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error while loading heroes
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/v1/heroes/player/{playerId}:
   *   get:
   *     summary: Get hero inventory for a player
    *     description: Returns full hero catalog with stable shape, current XP progress, xp threshold and player progress level defaults.
   *     tags: [Heroes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: playerId
   *         required: true
   *         schema:
   *           type: string
   *           pattern: '^[a-zA-Z0-9_-]+$'
   *         description: Player identifier
   *     responses:
   *       200:
   *         description: Player hero inventory returned successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/Success'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         heroes:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/PlayerHeroInventoryItem'
   *       401:
   *         description: Missing or invalid bearer token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Server error while loading player heroes
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getPlayerHeroes = ErrorHandlerMiddleware.asyncHandler(async (req, res) => {
    const { playerId } = req.params;

    const result = await this.getPlayerHeroesUseCase.execute(playerId);
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