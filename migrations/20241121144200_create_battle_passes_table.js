// migrations/YYYYMMDDHHMMSS_create_battle_passes_table.js
exports.up = function(knex) {
    return knex.schema.createTable('battle_passes', function(table) {
      table.increments('id').primary();
      table.string('playerId').references('playerId').inTable('players').onDelete('CASCADE');
      table.integer('level').defaultTo(1);
      table.integer('experience').defaultTo(0);
      table.timestamps(true, true);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('battle_passes');
  };