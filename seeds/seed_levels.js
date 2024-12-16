// seeds/seed_battle_pass_rewards.js
exports.seed = async function (knex) {
  // Eliminar todos los datos existentes en la tabla
  await knex('battle_pass_rewards').del();

  // Insertar los datos iniciales
  await knex('battle_pass_rewards').insert([
    { id: 1, level: 1, reward: JSON.stringify({ type: 'gold', count: '100' }), created_at: '2024-12-16T14:16:30.000Z', updated_at: '2024-12-16T14:16:30.000Z' },
    { id: 2, level: 2, reward: JSON.stringify({ type: 'profilePicture', count: '1' }), created_at: '2024-12-16T14:16:56.000Z', updated_at: '2024-12-16T14:16:56.000Z' },
    { id: 3, level: 3, reward: JSON.stringify({ type: 'profileBackground', count: '1' }), created_at: '2024-12-16T14:17:14.000Z', updated_at: '2024-12-16T14:17:14.000Z' },
    { id: 4, level: 4, reward: JSON.stringify({ type: 'profileAvatar', count: '1' }), created_at: '2024-12-16T14:17:33.000Z', updated_at: '2024-12-16T14:17:33.000Z' },
    { id: 5, level: 5, reward: JSON.stringify({ type: 'powerup', count: 'joker' }), created_at: '2024-12-16T14:18:35.000Z', updated_at: '2024-12-16T14:18:35.000Z' },
    { id: 6, level: 6, reward: JSON.stringify({ type: 'gold', count: '15' }), created_at: '2024-12-16T14:18:52.000Z', updated_at: '2024-12-16T14:18:52.000Z' },
    { id: 7, level: 7, reward: JSON.stringify({ type: 'profilePicture', count: '2' }), created_at: '2024-12-16T14:19:26.000Z', updated_at: '2024-12-16T14:19:26.000Z' },
    { id: 8, level: 8, reward: JSON.stringify({ type: 'profileBackground', count: '2' }), created_at: '2024-12-16T14:19:39.000Z', updated_at: '2024-12-16T14:19:39.000Z' },
    { id: 9, level: 9, reward: JSON.stringify({ type: 'profileAvatar', count: '2' }), created_at: '2024-12-16T14:19:51.000Z', updated_at: '2024-12-16T14:19:51.000Z' },
    { id: 10, level: 10, reward: JSON.stringify({ type: 'powerup', count: 'lead' }), created_at: '2024-12-16T14:20:13.000Z', updated_at: '2024-12-16T14:20:13.000Z' },
  ]);
};
