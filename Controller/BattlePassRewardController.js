// controllers/battlePassRewardController.js
const battlePassRewardModel = require('../Model/BattlePassReward');
const customLogger = require('../utils/logger').customLogger;

const createReward = async (req, res) => {
  const { level, reward } = req.body;

  try {
    const existingReward = await battlePassRewardModel.getRewardByLevel(level);
    if (existingReward) {
      return res.status(409).json({ message: 'Reward for this level already exists' });
    }

    const newReward = await battlePassRewardModel.createReward(level, reward);
    res.status(201).json(newReward);
  } catch (error) {
    console.error(error);
    customLogger.error(error);
    res.status(500).json({ message: 'Error while creating reward' });
  }
};

const updateReward = async (req, res) => {
  const { id } = req.params;
  const { reward } = req.body;

  try {
    const updatedReward = await battlePassRewardModel.updateReward(id, reward);
    res.json(updatedReward);
  } catch (error) {
    console.error(error);
    customLogger.error(error);
    res.status(500).json({ message: 'Error while updating reward' });
  }
};

const deleteReward = async (req, res) => {
  const { id } = req.params;

  try {
    await battlePassRewardModel.deleteReward(id);
    res.json({ message: 'Reward deleted successfully' });
  } catch (error) {
    console.error(error);
    customLogger.error(error);
    res.status(500).json({ message: 'Error while deleting reward' });
  }
};

module.exports = {
  createReward,
  updateReward,
  deleteReward
};