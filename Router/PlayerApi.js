const express = require('express');
const router = express.Router();
const playerController = require('../Controller/PlayerController');
const authenticate = require('../Middlewares/AuthMiddleware');

// Endpoint para autenticar usuarios y generar un token JWT basado en playerId
router.post('/login', playerController.login);

// Endpoint para agregar un jugador
router.post('/', playerController.addPlayer);

// Endpoint para validar si un nickname está disponible
router.get('/validate/:nickname', authenticate, playerController.validateNickname);

// Endpoint para obtener el Player ID por nickname
router.get('/:nickname', authenticate, playerController.getPlayerIdByNickname);

// Endpoint para obtener jugador por ID
router.get('/id/:playerId', authenticate, playerController.getPlayerById);

// Endpoint para actualizar el nickname de un jugador por playerId
router.put('/nickname/:playerId', authenticate, playerController.updatePlayerNickname);

module.exports = router;