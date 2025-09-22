exports.seed = async function (knex) {
  await knex('battle_pass_rewards').del(); // Limpia la tabla antes de insertar

  await knex('battle_pass_rewards').insert([
    { id: 1, level: 1, reward: JSON.stringify({ type: 'gold', body: { amount: 100 } }) },
    { id: 2, level: 2, reward: JSON.stringify({ type: 'profilePicture_1', body: { id: 1 } }) },
    { id: 3, level: 3, reward: JSON.stringify({ type: 'profileBackground_1', body: { id: 1 } }) },
    { id: 4, level: 4, reward: JSON.stringify({ type: 'profileAvatar_1', body: { id: 1 } }) },
    { id: 5, level: 5, reward: JSON.stringify({ type: 'powerup', body: { powerup: 'POWERUP_JOKER', quantity: 10 } }) },
    { id: 6, level: 6, reward: JSON.stringify({ type: 'gold', body: { amount: 15 } }) },
    { id: 7, level: 7, reward: JSON.stringify({ type: 'profilePicture_2', body: { id: 2 } }) },
    { id: 8, level: 8, reward: JSON.stringify({ type: 'profileBackground_2', body: { id: 2 } }) },
    { id: 9, level: 9, reward: JSON.stringify({ type: 'profileAvatar_2', body: { id: 2 } }) },
    { id: 10, level: 10, reward: JSON.stringify({ type: 'powerup', body: { powerup: 'POWERUP_LEAD', quantity: 7 } }) },
  ]);
};
