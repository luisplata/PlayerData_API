// models/playerModel.js
const db = require('../DB/db.js');

const getPlayerById = async (playerId) => {
  return await db('players').where({ playerId }).first();
};

const createPlayer = async (playerId, nickname) => {
  return await db('players')
    .insert({ playerId, nickname });
};

const getPlayerByNicknameOrId = async (nickname, playerId) => {
  return await db('players')
    .where({ nickname })
    .orWhere({ playerId })
    .first();
};

const getPlayerByNickname = async (nickname) => {
  return await db('players').where({ nickname }).first();
};

const updatePlayerNickname = async (playerId, nickname) => {
  return await db('players')
    .where({ playerId })
    .update({ nickname });
};

const isValidNickname = async (nickname) => {
  const player = await getPlayerByNickname(nickname);
  return !player;
};

module.exports = {
  getPlayerById,
  createPlayer,
  getPlayerByNicknameOrId,
  getPlayerByNickname,
  updatePlayerNickname,
  isValidNickname
};