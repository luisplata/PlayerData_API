exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable('heroes', function(table) {
            table.index('heroId', 'idx_heroes_heroId');
        }),
        knex.schema.alterTable('passives', function(table) {
            table.index('heroId', 'idx_passives_heroId');
        }),
        knex.schema.alterTable('dialogs', function(table) {
            table.index('heroId', 'idx_dialogs_heroId');
        }),
        knex.schema.alterTable('dialog_questions', function(table) {
            table.index('dialogId', 'idx_dialog_questions_dialogId');
        }),
        knex.schema.alterTable('player_passives', function(table) {
            table.index('playerId', 'idx_player_passives_playerId');
            table.index('heroId', 'idx_player_passives_heroId');
            table.index('passiveId', 'idx_player_passives_passiveId');
        })
    ]);
};

exports.down = function(knex) {
    // These indexes are backed by unique/FK constraints in MySQL, so dropping them here
    // causes rollback-all to fail before the owning tables are removed. The rollback for
    // this migration is therefore a no-op; the tables dropped by earlier migrations will
    // remove the underlying indexes safely.
    return Promise.resolve();
};