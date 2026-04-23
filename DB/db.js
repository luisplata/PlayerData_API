// db.js
const knex = require('knex');

require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const { buildConnection } = require('./mysqlConfig');

const db = knex({
  client: 'mysql2',
  connection: buildConnection()
});

module.exports = db;
