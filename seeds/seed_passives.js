exports.seed = async function (knex) {
  // Limpia la tabla antes de insertar
  await knex('passives').del();

  const now = new Date();

  await knex('passives').insert([
    {
      id: 1,
      passiveId: 'passive-nova-explosion',
      heroId: 'hero-nova',
      name: 'Explosion',
      metadata: JSON.stringify({
        description: 'Explosion area damage',
        maxLevel: 20,
        // Rango de la explosion según nivel del héroe: niveles bajos -> rango bajo; niveles altos -> rango mayor
        ranges: [
          { minLevel: 1, maxLevel: 9, range: 1 },
          { minLevel: 10, maxLevel: 20, range: 2 }
        ]
      }),
      created_at: now,
      updated_at: now
    }
  ]);
};
