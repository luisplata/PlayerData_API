// models/playerRewardModel.js
const db = require('../DB/db.js');

const battlePassRewardModel = require('./BattlePassReward.js');
const { RewardNotFoundError, RewardAlreadyAwardedError } = require('../utils/errors.js');


const getPlayerRewards = async (playerId) => {
  return await db('player_rewards').where({ playerId });
};

const awardReward = async (playerId, level) => {
  // Verificar si el premio para el nivel existe
  const reward = await battlePassRewardModel.getRewardByLevel(level);
  if (!reward) {
    throw new RewardNotFoundError('Reward for this level does not exist');
  }

  // Verificar si el jugador ya ha recibido este premio
  const existingReward = await db('player_rewards')
    .where({ playerId, rewardId: reward.id })
    .first();
  if (existingReward) {
    throw new RewardAlreadyAwardedError('Player has already received this reward');
  }

  // Otorgar el premio al jugador
  return await db('player_rewards')
    .insert({ playerId, rewardId: reward.id });
};


module.exports = {
  getPlayerRewards,
  awardReward
};