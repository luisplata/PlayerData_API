// routes/playerRewardRoutes.js
const express = require('express');
const router = express.Router();
const playerRewardController = require('../Controller/PlayerRewardController.js');
const authenticate = require('../Middlewares/AuthMiddleware.js');

// Endpoint para obtener los premios de un jugador
router.get('/:playerId', authenticate, playerRewardController.getPlayerRewards);

// Endpoint para obtener los premios no reclamados de un jugador
router.get('/:playerId/unclaimed', authenticate, playerRewardController.getUnclaimedRewards);

// Endpoint para reclamar un premio
router.post('/claim', authenticate, playerRewardController.claimReward);

// Endpoint para otorgar un premio a un jugador
router.post('/award', authenticate, playerRewardController.awardReward);

module.exports = router;