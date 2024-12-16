exports.seed = async function (knex) {
  await knex('battle_pass_rewards').del(); // Limpia la tabla antes de insertar

  await knex('battle_pass_rewards').insert([
    { id: 1, level: 1, reward: JSON.stringify({ type: 'gold', count: '100' }) },
    { id: 2, level: 2, reward: JSON.stringify({ type: 'profilePicture', count: '1' }) },
    { id: 3, level: 3, reward: JSON.stringify({ type: 'profileBackground', count: '1' }) },
    { id: 4, level: 4, reward: JSON.stringify({ type: 'profileAvatar', count: '1' }) },
    { id: 5, level: 5, reward: JSON.stringify({ type: 'powerup', count: 'joker' }) },
    { id: 6, level: 6, reward: JSON.stringify({ type: 'gold', count: '15' }) },
    { id: 7, level: 7, reward: JSON.stringify({ type: 'profilePicture', count: '2' }) },
    { id: 8, level: 8, reward: JSON.stringify({ type: 'profileBackground', count: '2' }) },
    { id: 9, level: 9, reward: JSON.stringify({ type: 'profileAvatar', count: '2' }) },
    { id: 10, level: 10, reward: JSON.stringify({ type: 'powerup', count: 'lead' }) },
  ]);
};
