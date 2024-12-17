// controllers/battlePassController.js
const battlePassModel = require('../Model/BattlePass');
const customLogger = require('../utils/logger').customLogger;
const { RewardNotFoundError, RewardAlreadyAwardedError } = require('../utils/errors.js');

const getBattlePass = async (req, res) => {
  const { playerId } = req.params;

  try {
    const battlePass = await battlePassModel.ensureBattlePassExists(playerId);
    const playerRewards = await battlePassModel.getPlayerRewards(playerId);
    res.json({ ...battlePass, playerRewards });
  } catch (error) {
    console.error(error);
    customLogger.error(error);
    res.status(500).json({ message: 'Error while fetching battle pass' });
  }
};

const addExperience = async (req, res) => {
  const { playerId } = req.params;
  const { experience } = req.body;

  try {
    const updatedBattlePass = await battlePassModel.addExperience(playerId, experience);
    res.json(updatedBattlePass);
  } catch (error) {
    console.error(error);
    customLogger.error(error);

    if (error instanceof RewardNotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    if (error instanceof RewardAlreadyAwardedError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({ message: 'Error while adding experience' });
  }
};

module.exports = {
  getBattlePass,
  addExperience
};