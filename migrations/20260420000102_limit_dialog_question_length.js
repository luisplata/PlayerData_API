exports.up = function (knex) {
  return knex.schema.alterTable('dialog_questions', function (table) {
    table.string('question', 280).notNullable().alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('dialog_questions', function (table) {
    table.text('question').notNullable().alter();
  });
};
