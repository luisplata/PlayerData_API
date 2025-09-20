// migrations/YYYYMMDDHHMMSS_create_player_rewards_table.js
exports.up = function (knex) {
    return knex.schema.createTable('player_rewards', function (table) {
        table.increments('id').primary();
        table.string('playerId').references('playerId').inTable('players').onDelete('CASCADE');
        table.integer('rewardId').unsigned().references('id').inTable('battle_pass_rewards').onDelete('CASCADE');
        table.timestamp('awarded_at').defaultTo(knex.fn.now());
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('player_rewards');
};