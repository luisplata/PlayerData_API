exports.up = function(knex) {
    return knex.schema.createTable('passives', function(table) {
        table.increments('id').primary();
        table.string('passiveId').notNullable().unique();
        table.string('heroId').notNullable().references('heroId').inTable('heroes').onDelete('CASCADE');
        table.string('name').notNullable();
        table.json('metadata').notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('passives');
};
