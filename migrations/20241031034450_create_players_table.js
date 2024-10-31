exports.up = function(knex) {
    return knex.schema.createTable('players', (table) => {
      table.increments('id').primary(); // Clave primaria autoincremental
      table.string('nickname').notNullable().unique(); // Nickname único
      table.string('playerId').notNullable().unique(); // Nickname único
      table.timestamps(true, true); // Campos created_at y updated_at
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('players');
  };
  