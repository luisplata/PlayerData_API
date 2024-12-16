#!/bin/sh

set -e

echo "Esperando a que la base de datos MySQL esté lista..."

# Esperar a MySQL
until nc -z -v -w30 $MYSQL_HOST $MYSQL_PORT
do
  echo "Esperando la base de datos MySQL en host ($MYSQL_HOST) y puerto ($MYSQL_PORT)..."
  sleep 1
done

echo "La base de datos MySQL está lista, ejecutando migraciones..."

# Ejecutar las migraciones de Knex
npm run migrate

echo "Migraciones ejecutadas, ejecutando semillas..."

# Ejecutar las semillas de Knex
npm run seed

echo "Semillas ejecutadas, iniciando la aplicación..."

# Iniciar la aplicación Node.js
npm start
