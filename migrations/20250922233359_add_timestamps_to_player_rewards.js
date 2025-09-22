/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('player_rewards', function (table) {
      table.timestamps(true, true); 
      // crea columnas created_at y updated_at
      // true, true => con zona horaria y default a now()
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    return knex.schema.alterTable('player_rewards', function (table) {
      table.dropTimestamps();
      // elimina las columnas created_at y updated_at
    });
  };
  