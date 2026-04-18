const fs = require('fs');

function isRunningInDocker() {
  return fs.existsSync('/.dockerenv');
}

function resolveMysqlHost() {
  const configuredHost = process.env.MYSQL_HOST;

  if (configuredHost && configuredHost !== 'db_mysql') {
    return configuredHost;
  }

  return isRunningInDocker() ? 'db_mysql' : 'localhost';
}

function buildConnection() {
  return {
    host: resolveMysqlHost(),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || 'playerdb',
    port: process.env.MYSQL_PORT || 3306,
    connectTimeout: 60000
  };
}

function buildKnexConfig() {
  return {
    client: 'mysql2',
    connection: buildConnection(),
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  };
}

module.exports = {
  buildConnection,
  buildKnexConfig
};