#!/bin/sh

set -e

echo "Esperando a que la base de datos esté lista..."

until nc -z -v -w30 $PGHOST $PGPORT
do
  echo "Esperando la base de datos en host ($PGHOST) y puerto ($PGPORT)..."
  sleep 1
done

echo "La base de datos está lista, ejecutando migraciones..."

# Ejecutar las migraciones de Knex
npm run migrate

echo "Migraciones ejecutadas, iniciando la aplicación..."

# Iniciar la aplicación Node.js
npm start
