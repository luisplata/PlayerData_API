# PlayerData_API

> **🚀 Nueva Arquitectura**: Este proyecto ahora utiliza **Clean Architecture** para mejor mantenibilidad, testabilidad y escalabilidad. Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles completos.

## ✨ Mejoras Implementadas

- ✅ **Clean Architecture** con separación de capas
- ✅ **Seguridad mejorada** con variables de entorno
- ✅ **Validación robusta** de datos de entrada
- ✅ **Manejo de errores centralizado**
- ✅ **Índices de base de datos** para mejor performance
- ✅ **Tests expandidos** con cobertura de arquitectura
- ✅ **Health check endpoint** para monitoreo
- ✅ **Versionado de API** con `/api/v1/`
- ✅ **Documentación Swagger** completa
- ✅ **Transacciones de base de datos**

### 3) Ejecutar migraciones
- Con script de npm:
```bash
npm run migrate
```

- Para limpiar toda la base, volver a aplicar todas las migraciones y cargar seeds:
```bash
npm run clean:migrate:seed
```

- O directamente con Knex (equivalente):
```bash
npx knex migrate:latest
```

Esto creará las tablas definidas en `migrations/`.

- Crear migracion
```bash
npx knex migrate:make add_timestamps_to_player_rewards
```

### 4) Ejecutar seeds
- Con script de npm:
```bash
npm run seed
```

- O directamente con Knex (opcionalmente especificando el entorno):
```bash
npx knex seed:run
```

Esto llenará la base con los datos iniciales definidos en `seeds/` (por ejemplo `seeds/seed_levels.js`).

### Notas
- La configuración de Knex está en `knexfile.js`. Los entornos `development` y `development_mysql` apuntan a MySQL y comparten la misma configuración por defecto.
- Variables de entorno usadas por la app/Knex (con defaults): `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_PORT`.
- Para revertir la última migración:
```bash
npx knex migrate:rollback
```

- Para limpiar todo, recrear el esquema y cargar seeds:
```bash
npm run clean:migrate:seed
```

### Ejemplos rápidos
- Limpiar, migrar y seed en un paso:
```bash
npm run clean:migrate:seed
```

- Migrar y seed en un paso sin limpiar:
```bash
npx knex migrate:latest && npx knex seed:run
```
GET  /api/v1/player/validate/:nick # Validar nickname
GET  /api/v1/player/:nick          # Obtener por nickname
GET  /api/v1/player/id/:id         # Obtener por ID
PUT  /api/v1/player/nickname/:id   # Actualizar nickname
GET  /api/v1/battle-pass/:id       # Obtener battle pass
POST /api/v1/battle-pass/experience # Agregar experiencia
```

### **Legacy API (Deprecado)**
```
POST /api/player/login          # ⚠️ Deprecado - usar /api/v1/
POST /api/player                # ⚠️ Deprecado - usar /api/v1/
GET  /api/player/validate/:nick # ⚠️ Deprecado - usar /api/v1/
GET  /api/player/:nick          # ⚠️ Deprecado - usar /api/v1/
GET  /api/player/id/:id         # ⚠️ Deprecado - usar /api/v1/
PUT  /api/player/nickname/:id   # ⚠️ Deprecado - usar /api/v1/
GET  /api/battle-pass/:id       # ⚠️ Deprecado - usar /api/v1/
POST /api/battle-pass/experience # ⚠️ Deprecado - usar /api/v1/
```

### **Sistema y Monitoreo**
```
GET  /health                    # Health check básico
GET  /health/detailed           # Health check detallado
GET  /health/live               # Liveness probe
GET  /health/ready              # Readiness probe
GET  /api/versions              # Información de versiones
GET  /api-docs                  # Documentación Swagger
```

### **Información de Versiones**
```bash
curl http://localhost:8080/api/versions
```

## 📋 Migraciones y Seeds (llenar datos iniciales)

Sigue estos pasos para crear las tablas y poblar la base de datos con datos iniciales usando Knex.

### 1) Instalar dependencias
```bash
npm install
```

### 2) Asegurar base de datos en ejecución
- Si usas Docker (recomendado para desarrollo):
```bash
docker compose up -d
```
Esto levanta `mysql:8` y la app apuntando a `db_mysql` (ver `docker-compose.yml`).

### 3) Ejecutar migraciones
- Con script de npm:
```bash
npm run migrate
```

- Para limpiar toda la base y volver a aplicar todas las migraciones:
```bash
npm run clean:migrate
```

- O directamente con Knex (equivalente):
npm run clean:migrate:seed
```bash
```bash
npm run clean:migrate:seed
```

Esto creará las tablas definidas en `migrations/`.
npm run clean:migrate:seed
```bash
```bash
npm run clean:migrate:seed
```bash
npx knex migrate:make add_timestamps_to_player_rewards
```
- Limpiar, migrar y seed en un paso:
```bash
npm run clean:migrate:seed
```

- Migrar y seed en un paso sin limpiar:
### 4) Ejecutar seeds
- Con script de npm:
```bash
npm run seed
```

- O directamente con Knex (opcionalmente especificando el entorno):
```bash
npx knex seed:run
```

Esto llenará la base con los datos iniciales definidos en `seeds/` (por ejemplo `seeds/seed_levels.js`).

### Notas
- La configuración de Knex está en `knexfile.js`. Los entornos `development` y `development_mysql` apuntan a MySQL y comparten la misma configuración por defecto.
- Variables de entorno usadas por la app/Knex (con defaults): `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_PORT`.
- Para revertir la última migración:
```bash
npx knex migrate:rollback
```

- Para limpiar todo y recrear el esquema:
```bash
npm run clean:migrate
```

### Ejemplos rápidos
- Migrar y seed en un paso:
```bash
npx knex migrate:latest && npx knex seed:run
```

## cURL para probar la API

Usa `http://localhost:8080` si corres con `npm start`. Si usas Docker (mapea 80->8080), usa `http://localhost`.

Reemplaza `TOKEN` por el JWT devuelto en login.

### Player

- Login (obtiene JWT):
```bash
curl -X POST http://localhost:8080/api/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId": "player-1"}'
```

- Crear/actualizar jugador (requiere key):
```bash
curl -X POST http://localhost:8080/api/player \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","nickname":"Alice","key":"your_player_key"}'
```

- Validar nickname disponible:
```bash
curl -X GET http://localhost:8080/api/player/validate/Alice \
  -H "Authorization: Bearer TOKEN"
```

- Obtener playerId por nickname:
```bash
curl -X GET http://localhost:8080/api/player/Alice \
  -H "Authorization: Bearer TOKEN"
```

- Obtener jugador por ID:
```bash
curl -X GET http://localhost:8080/api/player/id/player-1 \
  -H "Authorization: Bearer TOKEN"
```

- Actualizar nickname:
```bash
curl -X PUT http://localhost:8080/api/player/nickname/player-1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Alice2"}'
```

### Battle Pass

- Obtener pase de batalla + rewards del jugador:
```bash
curl -X GET http://localhost:8080/api/battle-pass/player-1 \
  -H "Authorization: Bearer TOKEN"
```

- Agregar experiencia:
```bash
curl -X POST http://localhost:8080/api/battle-pass/experience \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","experience":50}'
```

### Battle Pass Rewards

- Listar rewards (público):
```bash
curl -X GET http://localhost:8080/api/battle-pass-reward
```

- Crear reward:
```bash
curl -X POST http://localhost:8080/api/battle-pass-reward \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "level": 11,
    "reward": { "type": "gold", "body": { "amount": 200 } }
  }'
```

- Actualizar reward:
```bash
curl -X PUT http://localhost:8080/api/battle-pass-reward/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reward": { "type": "powerup", "body": { "powerup": "joker", "quantity": 2 } }
  }'
```

- Eliminar reward:
```bash
curl -X DELETE http://localhost:8080/api/battle-pass-reward/1 \
  -H "Authorization: Bearer TOKEN"
```

Tipos y body válidos:
- gold: `{ "type": "gold", "body": { "amount": number } }`
- profilePicture|profileBackground|profileAvatar: `{ "type": "...", "body": { "id": number } }`
- powerup: `{ "type": "powerup", "body": { "powerup": string, "quantity": number } }`

### Player Rewards

- Listar rewards del jugador:
```bash
curl -X GET http://localhost:8080/api/player-reward/player-1 \
  -H "Authorization: Bearer TOKEN"
```

- Listar rewards no reclamados del jugador:
```bash
curl -X GET http://localhost:8080/api/player-reward/player-1/unclaimed \
  -H "Authorization: Bearer TOKEN"
```

- Reclamar reward (por nivel):
```bash
curl -X POST http://localhost:8080/api/player-reward/claim \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","level":1}'
```

- Otorgar reward (por nivel):
```bash
curl -X POST http://localhost:8080/api/player-reward/award \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","level":2}'
```
