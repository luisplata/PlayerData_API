// migrations/YYYYMMDDHHMMSS_add_claimed_to_player_rewards.js
exports.up = function (knex) {
    return knex.schema.table('player_rewards', function (table) {
        table.boolean('claimed').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.table('player_rewards', function (table) {
        table.dropColumn('claimed');
    });
};