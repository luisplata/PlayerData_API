exports.up = function(knex) {
    return knex.schema.createTable('player_hero_progress', function(table) {
        table.increments('id').primary();
        table.string('playerId').notNullable().references('playerId').inTable('players').onDelete('CASCADE');
        table.string('heroId').notNullable().references('heroId').inTable('heroes').onDelete('CASCADE');
        table.integer('level').unsigned().notNullable().defaultTo(0);
        table.timestamps(true, true);

        table.unique(['playerId', 'heroId'], 'uq_player_hero_progress');
        table.index('playerId', 'idx_player_hero_progress_playerId');
        table.index('heroId', 'idx_player_hero_progress_heroId');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('player_hero_progress');
};