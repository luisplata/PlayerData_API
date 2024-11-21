// controllers/playerRewardController.js
const playerRewardModel = require('../Model/PlayerReward');
const customLogger = require('../utils/logger').customLogger;
const { RewardNotFoundError, RewardAlreadyAwardedError } = require('../utils/errors.js');

const awardReward = async (req, res) => {
  const { playerId, level } = req.body;

  try {
    const newPlayerReward = await playerRewardModel.awardReward(playerId, level);
    res.status(201).json(newPlayerReward);
  } catch (error) {
    console.error(error);
    customLogger.error(error);

    if (error instanceof RewardNotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    if (error instanceof RewardAlreadyAwardedError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({ message: 'Error while awarding reward' });
  }
};

const getPlayerRewards = async (req, res) => {
  const { playerId } = req.params;

  try {
    const rewards = await playerRewardModel.getPlayerRewards(playerId);
    res.json(rewards);
  } catch (error) {
    console.error(error);
    customLogger.error(error);
    res.status(500).json({ message: 'Error while fetching player rewards' });
  }
};

module.exports = {
  awardReward,
  getPlayerRewards
};