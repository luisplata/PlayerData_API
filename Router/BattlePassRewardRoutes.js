// routes/battlePassRewardRoutes.js
const express = require('express');
const router = express.Router();
const authenticate = require('../Middlewares/AuthMiddleware.js');

const battlePassRewardController = require('../Controller/BattlePassRewardController.js');
// Endpoint para crear un premio
router.post('/', authenticate, battlePassRewardController.createReward);

// Endpoint para actualizar un premio
router.put('/:id', authenticate, battlePassRewardController.updateReward);

// Endpoint para eliminar un premio
router.delete('/:id', authenticate, battlePassRewardController.deleteReward);

// Endpoint para obtener la lista de premios
router.get('/', battlePassRewardController.getRewards);

module.exports = router;