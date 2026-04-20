exports.seed = async function (knex) {
  const heroId = 'hero-nova';
  const now = new Date();

  await knex('heroes').where({ heroId }).del();

  await knex('heroes').insert({
    heroId,
    name: 'Nova',
    metadata: JSON.stringify({
      role: 'support',
      xpPerLevel: 100,
      pointsLostPerGame: 2,
      minPointsGainedPerConversation: 1,
      pointsGainedPerConversationComplete: 10
    }),
    created_at: now,
    updated_at: now
  });
};
