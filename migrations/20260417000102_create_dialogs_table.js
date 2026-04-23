exports.up = function (knex) {
  return knex.schema.createTable('dialogs', table => {
    table.increments('id').primary();
    table.string('dialogId').notNullable().unique();
    table
      .string('heroId')
      .notNullable()
      .references('heroId')
      .inTable('heroes')
      .onDelete('CASCADE');
    table.string('title').notNullable();
    table.json('metadata').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('dialogs');
};
