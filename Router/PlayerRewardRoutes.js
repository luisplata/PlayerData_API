// routes/playerRewardRoutes.js
const express = require('express');
const router = express.Router();
const playerRewardController = require('../Controller/PlayerRewardController.js');
const authenticate = require('../Middlewares/AuthMiddleware.js');

/**
 * @swagger
 * tags:
 *   name: Player Rewards
 *   description: Endpoints to award, claim and list player rewards
 */

// Endpoint para obtener los premios de un jugador
/**
 * @swagger
 * /api/v1/player-reward/{playerId}:
 *   get:
 *     summary: Get all rewards for a player
 *     tags: [Player Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Player rewards list
 *       500:
 *         description: Server error
 */
router.get('/:playerId', authenticate, playerRewardController.getPlayerRewards);

// Endpoint para obtener los premios no reclamados de un jugador
/**
 * @swagger
 * /api/v1/player-reward/{playerId}/unclaimed:
 *   get:
 *     summary: Get unclaimed rewards for a player
 *     tags: [Player Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unclaimed rewards list
 *       500:
 *         description: Server error
 */
router.get(
  '/:playerId/unclaimed',
  authenticate,
  playerRewardController.getUnclaimedRewards
);

// Endpoint para reclamar un premio
/**
 * @swagger
 * /api/v1/player-reward/claim:
 *   post:
 *     summary: Claim a reward for a player
 *     tags: [Player Rewards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - level
 *             properties:
 *               playerId:
 *                 type: string
 *               level:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Reward claimed
 *       404:
 *         description: Reward not found
 *       409:
 *         description: Reward already claimed/awarded
 *       500:
 *         description: Server error
 */
router.post('/claim', authenticate, playerRewardController.claimReward);

// Endpoint para otorgar un premio a un jugador
/**
 * @swagger
 * /api/v1/player-reward/award:
 *   post:
 *     summary: Award a reward to a player
 *     tags: [Player Rewards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - level
 *             properties:
 *               playerId:
 *                 type: string
 *               level:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Reward awarded
 *       404:
 *         description: Reward not found
 *       409:
 *         description: Reward already awarded
 *       500:
 *         description: Server error
 */
router.post('/award', authenticate, playerRewardController.awardReward);

module.exports = router;
