// models/battlePassModel.js
const db = require('../DB/db.js');
const battlePassRewardModel = require('./BattlePassReward.js');
const playerRewardModel = require('./PlayerReward.js');

const getBattlePassByPlayerId = async (playerId) => {
  return await db('battle_passes').where({ playerId }).first();
};

const createBattlePass = async (playerId) => {
  // Verificar si el playerId existe en la tabla players
  const playerExists = await db('players').where({ playerId }).first();
  if (!playerExists) {
    throw new Error('Player ID does not exist');
  }

  return await db('battle_passes')
    .insert({ playerId, level: 1, experience: 0 });
};

const updateBattlePass = async (playerId, level, experience) => {
  return await db('battle_passes')
    .where({ playerId })
    .update({ level, experience });
};

const ensureBattlePassExists = async (playerId) => {
  let battlePass = await getBattlePassByPlayerId(playerId);
  if (!battlePass) {
    await createBattlePass(playerId);
    battlePass = await getBattlePassByPlayerId(playerId);
  }
  return battlePass;
};

const addExperience = async (playerId, experience) => {
  let battlePass = await ensureBattlePassExists(playerId);

  let newExperience = battlePass.experience + experience;
  let newLevel = battlePass.level;
  let reward = null;

  // Lógica para subir de nivel si la experiencia supera un umbral
  if (newExperience >= 100) {
    newLevel += 1;
    newExperience = 0; // Resetear experiencia al subir de nivel

    // Obtener el premio para el nuevo nivel
    reward = await battlePassRewardModel.getRewardByLevel(newLevel);
    if (reward) {
      await playerRewardModel.awardReward(playerId, newLevel);
    }
  }

  await updateBattlePass(playerId, newLevel, newExperience);
  return { ...battlePass, level: newLevel, experience: newExperience, reward };
};

const getPlayerRewards = async (playerId) => {
  return await db('player_rewards').where({ playerId });
};

module.exports = {
  getBattlePassByPlayerId,
  createBattlePass,
  updateBattlePass,
  ensureBattlePassExists,
  addExperience,
  getPlayerRewards
};