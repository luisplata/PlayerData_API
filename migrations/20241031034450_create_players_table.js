// migrations/YYYYMMDDHHMMSS_create_players_table.js
exports.up = function (knex) {
  return knex.schema.createTable('players', function (table) {
    table.string('playerId').primary();
    table.string('nickname').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('players');
};