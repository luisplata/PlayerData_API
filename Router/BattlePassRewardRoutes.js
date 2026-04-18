// routes/battlePassRewardRoutes.js
const express = require('express');
const router = express.Router();
const authenticate = require('../Middlewares/AuthMiddleware.js');

const battlePassRewardController = require('../Controller/BattlePassRewardController.js');
/**
 * @swagger
 * tags:
 *   name: Battle Pass Rewards
 *   description: CRUD endpoints for battle pass rewards catalog
 */
// Endpoint para crear un premio
/**
 * @swagger
 * /api/v1/battle-pass-reward:
 *   post:
 *     summary: Create a battle pass reward
 *     tags: [Battle Pass Rewards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - level
 *               - reward
 *             properties:
 *               level:
 *                 type: integer
 *               reward:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       201:
 *         description: Reward created
 *       409:
 *         description: Reward already exists for level
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, battlePassRewardController.createReward);

// Endpoint para actualizar un premio
/**
 * @swagger
 * /api/v1/battle-pass-reward/{id}:
 *   put:
 *     summary: Update a battle pass reward
 *     tags: [Battle Pass Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reward
 *             properties:
 *               reward:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       200:
 *         description: Reward updated
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticate, battlePassRewardController.updateReward);

// Endpoint para eliminar un premio
/**
 * @swagger
 * /api/v1/battle-pass-reward/{id}:
 *   delete:
 *     summary: Delete a battle pass reward
 *     tags: [Battle Pass Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reward deleted
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, battlePassRewardController.deleteReward);

// Endpoint para obtener la lista de premios
/**
 * @swagger
 * /api/v1/battle-pass-reward:
 *   get:
 *     summary: List battle pass rewards
 *     tags: [Battle Pass Rewards]
 *     responses:
 *       200:
 *         description: Rewards list
 *       500:
 *         description: Server error
 */
router.get('/', battlePassRewardController.getRewards);

module.exports = router;