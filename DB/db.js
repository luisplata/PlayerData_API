// db.js
const knex = require('knex');
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
    connectTimeout: 60000, // Aumenta el tiempo de espera de la conexión a 60 segundos
    options: {
      allowPublicKeyRetrieval: true
    }
  }
});

module.exports = db;