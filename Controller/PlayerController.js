// controllers/playerController.js
const jwt = require('jsonwebtoken');
const playerModel = require('../Model/Player');
const playerReward = require('../Model/PlayerReward');
const battlePassRewardModel = require('../Model/BattlePassReward.js');
const customLogger = require('../utils/logger').customLogger;

const secretKey = 'your_secret_key';
const playerKey = 'your_player_key';

const login = async (req, res) => {
  const { playerId } = req.body;

  try {
    const player = await playerModel.getPlayerById(playerId);
    console.log(player);
    if (!player) {
      console.log('Invalid playerId');
      return res.status(401).json({ message: 'Invalid playerId' });
    }

    const token = jwt.sign({ playerId }, secretKey, { expiresIn: '1h' });
    console.log(token);
    res.json({ token });
  } catch (error) {
    console.error(error);
    customLogger.error(error);
    res.status(500).json({ message: 'Error while authenticating' });
  }
};

const addPlayer = async (req, res) => {
  const { playerId, nickname, key } = req.body;

  // Validar la clave
  if (key !== playerKey) {
    console.log('Unauthorized');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Verificar si ya existe un jugador con el mismo nickname o playerId
    const existingPlayer = await playerModel.getPlayerByNicknameOrId(nickname, playerId);

    if (existingPlayer) {
      const updatedRows = await playerModel.updatePlayerNickname(playerId, nickname);
      if (updatedRows === 0) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json({ message: "Nickname updated successfully" });
    } else {
      // Insertar nuevo jugador
      const newPlayer = await playerModel.createPlayer(playerId, nickname);
      //Create player_rewards row
      const reward = await battlePassRewardModel.getRewardByLevel(1);
      if (!reward) {
        throw new RewardNotFoundError('Reward for this level does not exist');
      }
      await playerReward.createPlayerReward(playerId, reward);
      res.status(201).json(newPlayer);
    }
  } catch (error) {
    console.error(error);
    customLogger.error(error);
    res.status(500).json({ message: 'Error while adding player' });
  }
};

const validateNickname = async (req, res) => {
  const { nickname } = req.params;

  try {
    const result = await playerModel.getPlayerByNickname(nickname);
    res.json(!result); // Devuelve true si el nickname está disponible
  } catch (error) {
    console.error(error);
    customLogger.error(error);
    res.status(500).json({ message: 'Error while validating nickname' });
  }
};

const getPlayerIdByNickname = async (req, res) => {
  const { nickname } = req.params;

  try {
    const player = await playerModel.getPlayerByNickname(nickname);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json({ playerId: player.playerId });
  } catch (error) {
    console.error(error);
    customLogger.error(error);
    res.status(500).json({ message: 'Error while getting player ID' });
  }
};

const getPlayerById = async (req, res) => {
  const { playerId } = req.params;

  try {
    const player = await playerModel.getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json(player);
  } catch (error) {
    console.error(error);
    customLogger.error(error);
    res.status(500).json({ message: 'Error while getting player by ID' });
  }
};

const updatePlayerNickname = async (req, res) => {
  const { playerId } = req.params;
  const { nickname } = req.body;

  try {
    //validamos si el nickname esta disponible
    if (await !playerModel.isValidNickname(nickname)) {
      return res.status(400).json({ message: "Nickname already in use" });
    }
    const updatedRows = await playerModel.updatePlayerNickname(playerId, nickname);

    if (updatedRows === 0) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json({ message: "Nickname updated successfully" });
  } catch (error) {
    console.error(error);
    customLogger.error(error);
    res.status(500).json({ message: 'Error while updating nickname' });
  }
};

module.exports = {
  login,
  addPlayer,
  validateNickname,
  getPlayerIdByNickname,
  getPlayerById,
  updatePlayerNickname
};