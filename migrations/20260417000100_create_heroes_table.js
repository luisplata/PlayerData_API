exports.up = function(knex) {
    return knex.schema.createTable('heroes', function(table) {
        table.increments('id').primary();
        table.string('heroId').notNullable().unique();
        table.string('name').notNullable();
        table.json('metadata').notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('heroes');
};
