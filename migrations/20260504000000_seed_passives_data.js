exports.up = async function (knex) {
  const passiveId = 'passive-nova-explosion';
  const now = new Date();

  // Ensure no duplicate
  await knex('passives').where({ passiveId }).del();

  await knex('passives').insert({
    passiveId,
    heroId: 'hero-nova',
    name: 'Explosion',
    metadata: JSON.stringify({
      description: 'Explosion area damage',
      maxLevel: 20,
      // niveles bajos -> rango bajo; niveles altos -> rango mayor
      ranges: [
        { minLevel: 1, maxLevel: 9, range: 1 },
        { minLevel: 10, maxLevel: 20, range: 2 }
      ]
    }),
    created_at: now,
    updated_at: now
  });
};

exports.down = async function (knex) {
  await knex('passives').where({ passiveId: 'passive-nova-explosion' }).del();
};
