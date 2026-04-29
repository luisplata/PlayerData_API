module.exports = {
  async deletePlayerData(
    db,
    { playerId, heroId, dialogId, questionId, skipConversations = false } = {}
  ) {
    try {
      if (playerId && heroId) {
        await db('player_hero_progress').where({ playerId, heroId }).del();
      }
    } catch (e) {}
    try {
      if (playerId) await db('player_passives').where({ playerId }).del();
    } catch (e) {}
    try {
      if (questionId && !skipConversations)
        await db('dialog_questions').where({ questionId }).del();
    } catch (e) {}
    try {
      if (dialogId && !skipConversations) await db('dialogs').where({ dialogId }).del();
    } catch (e) {}
    try {
      if (heroId) await db('heroes').where({ heroId }).del();
    } catch (e) {}
    try {
      if (playerId) await db('players').where({ playerId }).del();
    } catch (e) {}
  }
};
