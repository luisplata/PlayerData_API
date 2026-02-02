/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    const hasCreatedAt = await knex.schema.hasColumn('player_rewards', 'created_at');
    const hasUpdatedAt = await knex.schema.hasColumn('player_rewards', 'updated_at');
    
    if (!hasCreatedAt || !hasUpdatedAt) {
      return knex.schema.alterTable('player_rewards', function (table) {
        if (!hasCreatedAt) {
          table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        }
        if (!hasUpdatedAt) {
          table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
        }
      });
    }
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    return knex.schema.alterTable('player_rewards', function (table) {
      table.dropColumn('created_at');
      table.dropColumn('updated_at');
    });
  };
  