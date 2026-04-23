exports.up = function (knex) {
  return knex.schema.createTable('player_passives', table => {
    table.increments('id').primary();
    table
      .string('playerId')
      .notNullable()
      .references('playerId')
      .inTable('players')
      .onDelete('CASCADE');
    table
      .string('heroId')
      .notNullable()
      .references('heroId')
      .inTable('heroes')
      .onDelete('CASCADE');
    table
      .string('passiveId')
      .notNullable()
      .references('passiveId')
      .inTable('passives')
      .onDelete('CASCADE');
    table.timestamp('assigned_at').defaultTo(knex.fn.now());
    table.unique(['playerId', 'heroId', 'passiveId'], 'uq_player_hero_passive');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('player_passives');
};
