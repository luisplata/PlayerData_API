// routes/battlePassRoutes.js
const express = require('express');
const router = express.Router();
const battlePassController = require('../Controller/BattlePassController');
const authenticate = require('../Middlewares/AuthMiddleware');

// Endpoint para obtener el pase de batalla de un jugador
router.get('/:playerId', authenticate, battlePassController.getBattlePass);

// Endpoint para agregar experiencia al pase de batalla de un jugador
router.post('/:playerId/experience', authenticate, battlePassController.addExperience);

module.exports = router;