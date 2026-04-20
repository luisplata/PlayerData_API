exports.up = function (knex) {
  return knex.schema.alterTable('player_hero_progress', function (table) {
    table.integer('currentXp').unsigned().notNullable().defaultTo(0);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('player_hero_progress', function (table) {
    table.dropColumn('currentXp');
  });
};