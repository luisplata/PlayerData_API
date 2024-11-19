#!/bin/sh

set -e

echo "Esperando a que las bases de datos estén listas..."

# Esperar a PostgreSQL
until nc -z -v -w30 $PGHOST $PGPORT
do
  echo "Esperando la base de datos PostgreSQL en host ($PGHOST) y puerto ($PGPORT)..."
  sleep 1
done

# Esperar a MySQL
until nc -z -v -w30 $MYSQL_HOST $MYSQL_PORT
do
  echo "Esperando la base de datos MySQL en host ($MYSQL_HOST) y puerto ($MYSQL_PORT)..."
  sleep 1
done

echo "Las bases de datos están listas, ejecutando migraciones..."

# Ejecutar las migraciones de Knex
npm run migrate

echo "Migraciones ejecutadas, iniciando la aplicación..."

# Iniciar la aplicación Node.js
npm start