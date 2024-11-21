// routes/battlePassRewardRoutes.js
const express = require('express');
const router = express.Router();
const authenticate = require('../Middlewares/AuthMiddleware');
const battlePassRewardController = require('../Controller/BattlePassRewardController');

// Endpoint para crear un premio
router.post('/', authenticate, battlePassRewardController.createReward);

// Endpoint para actualizar un premio
router.put('/:id', authenticate, battlePassRewardController.updateReward);

// Endpoint para eliminar un premio
router.delete('/:id', authenticate, battlePassRewardController.deleteReward);

module.exports = router;