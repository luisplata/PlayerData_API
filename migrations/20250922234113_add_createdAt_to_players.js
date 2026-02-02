/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const hasCreatedAt = await knex.schema.hasColumn('players', 'createdAt');
    
    if (!hasCreatedAt) {
      return knex.schema.alterTable('players', function (table) {
        table.timestamp('createdAt').defaultTo(knex.fn.now());
      });
    }
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    return knex.schema.alterTable('players', function (table) {
      table.dropColumn('createdAt');
    });
  };
  