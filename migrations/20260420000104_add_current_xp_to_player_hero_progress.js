exports.up = function (knex) {
  return knex.schema.alterTable('player_hero_progress', table => {
    table.integer('currentXp').unsigned().notNullable().defaultTo(0);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('player_hero_progress', table => {
    table.dropColumn('currentXp');
  });
};
