exports.up = function (knex) {
  return knex.schema.createTable('dialog_questions', table => {
    table.increments('id').primary();
    table.string('questionId').notNullable().unique();
    table
      .integer('dialogId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('dialogs')
      .onDelete('CASCADE');
    table.string('node_sequence').notNullable();
    table.text('question').notNullable();
    table.string('correct_answer').notNullable();
    table.integer('order_index').notNullable();
    table.index('node_sequence', 'idx_dialog_questions_node_sequence');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('dialog_questions');
};
