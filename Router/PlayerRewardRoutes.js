// routes/playerRewardRoutes.js
const express = require('express');
const router = express.Router();
const playerRewardController = require('../Controller/PlayerRewardController');
const authenticate = require('../Middlewares/AuthMiddleware');

// Endpoint para otorgar un premio a un jugador
router.post('/award', authenticate, playerRewardController.awardReward);

// Endpoint para obtener los premios de un jugador
router.get('/:playerId', authenticate, playerRewardController.getPlayerRewards);

module.exports = router;