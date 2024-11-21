// migrations/YYYYMMDDHHMMSS_create_battle_pass_rewards_table.js
exports.up = function (knex) {
    return knex.schema.createTable('battle_pass_rewards', function (table) {
        table.increments('id').primary();
        table.integer('level').notNullable();
        table.string('reward').notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('battle_pass_rewards');
};