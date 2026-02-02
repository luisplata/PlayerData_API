# cURL Examples - PlayerData API

> Ejemplos de cURL para probar todos los endpoints de la API PlayerData

## 📝 Notas Importantes

- Usa `http://localhost:8080` si ejecutas con `npm start` localmente
- Usa `http://localhost` si ejecutas con Docker (mapea 80->8080)
- Reemplaza `TOKEN` por el JWT devuelto en el endpoint de login
- Todos los ejemplos asumen que la API está corriendo y accesible

## 🔐 Autenticación y Endpoints Públicos vs Privados

### Endpoints Públicos (Sin autenticación)
- `POST /api/v1/player/login` - Login (público)
- `POST /api/v2/player/login` - Login v2 (público)
- `GET /api/v1/player/validate/:nickname` - Validar nickname (público)
- `GET /api/battle-pass-reward` - Listar rewards (público)
- `GET /health*` - Health checks (público)
- `GET /api/versions` - Info de versiones (público)

### Endpoints con JWT (Requieren Token de Login)
- `GET /api/v1/player/:nickname` - Obtener por nickname
- `GET /api/v1/player/id/:playerId` - Obtener por ID
- `PUT /api/v1/player/nickname/:playerId` - Actualizar nickname
- `GET /api/v1/battle-pass/:playerId` - Obtener battle pass
- `POST /api/v1/battle-pass/experience` - Agregar experiencia
- `GET /api/player-reward/*` - Endpoints de player rewards
- `POST /api/battle-pass-reward` - Crear reward (admin)

### Endpoints con API Key (Requieren PLAYER_API_KEY)
- `POST /api/v1/player` - Crear jugador (requiere `key` en body)
- `POST /api/v2/player` - Crear jugador v2 (NO requiere key, public)
- `POST /api/player` - Legacy (requiere `key` en body)

## 🔍 Health Check y Monitoreo

### Health check básico
```bash
curl -X GET http://localhost/health
```

### Health check detallado
```bash
curl -X GET http://localhost/health/detailed
```

### Liveness probe
```bash
curl -X GET http://localhost/health/live
```

### Readiness probe
```bash
curl -X GET http://localhost/health/ready
```

### Información de versiones de API
```bash
curl -X GET http://localhost/api/versions
```

## 👤 Player Endpoints

### Login - Obtener JWT Token

**v2 (Recomendado con refresh tokens):**
```bash
curl -X POST http://localhost/api/v2/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","nickname":"Alice"}'
```

**v1 (Estable):**
```bash
curl -X POST http://localhost/api/v1/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'
```

**Legacy (Deprecado):**
```bash
curl -X POST http://localhost/api/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'
```

### Crear/Actualizar Jugador

⚠️ **IMPORTANTE:** Este endpoint requiere autenticación con `PLAYER_API_KEY`. No es público.

**v1 (Requiere PLAYER_API_KEY en variable de entorno):**
```bash
# Primero obtén la API Key desde las variables de entorno del servidor
API_KEY="tu_PLAYER_API_KEY_del_servidor"

curl -X POST http://localhost/api/v1/player \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","nickname":"Alice","key":"'$API_KEY'"}'
```

**v2 (No requiere API Key):**
```bash
curl -X POST http://localhost/api/v2/player \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","nickname":"Alice"}'
```

**Legacy (Deprecado - Requiere PLAYER_API_KEY):**
```bash
API_KEY="tu_PLAYER_API_KEY_del_servidor"

curl -X POST http://localhost/api/player \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","nickname":"Alice","key":"'$API_KEY'"}'
```

**Alternativa: Usar Login (Método Recomendado)**

El endpoint de **login es público** y es la forma recomendada de crear jugadores. Si el jugador no existe, se crea automáticamente:

```bash
curl -X POST http://localhost/api/v1/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'
```

O en v2 con refresh tokens:
```bash
curl -X POST http://localhost/api/v2/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","nickname":"Alice"}'
```

### Validar Nickname Disponible

**v1:**
```bash
curl -X GET http://localhost/api/v1/player/validate/Alice \
  -H "Authorization: Bearer TOKEN"
```

**Legacy (Deprecado):**
```bash
curl -X GET http://localhost/api/player/validate/Alice
```

### Obtener PlayerId por Nickname

**v1:**
```bash
curl -X GET http://localhost/api/v1/player/Alice \
  -H "Authorization: Bearer TOKEN"
```

**Legacy (Deprecado):**
```bash
curl -X GET http://localhost/api/player/Alice \
  -H "Authorization: Bearer TOKEN"
```

### Obtener Jugador por ID

**v1:**
```bash
curl -X GET http://localhost/api/v1/player/id/player-1 \
  -H "Authorization: Bearer TOKEN"
```

**Legacy (Deprecado):**
```bash
curl -X GET http://localhost/api/player/id/player-1 \
  -H "Authorization: Bearer TOKEN"
```

### Actualizar Nickname

**v1:**
```bash
curl -X PUT http://localhost/api/v1/player/nickname/player-1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Alice2"}'
```

**Legacy (Deprecado):**
```bash
curl -X PUT http://localhost/api/player/nickname/player-1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Alice2"}'
```

### Obtener Perfil (v2 con Refresh de Token)

```bash
curl -X GET http://localhost/api/v2/player/profile \
  -H "Authorization: Bearer TOKEN"
```

### Refrescar Token (v2)

```bash
curl -X POST http://localhost/api/v2/player/refresh \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REFRESH_TOKEN" \
  -d '{"playerId":"player-1"}'
```

## ⚔️ Battle Pass Endpoints

### Obtener Battle Pass + Rewards del Jugador

**v1:**
```bash
curl -X GET http://localhost/api/v1/battle-pass/player-1 \
  -H "Authorization: Bearer TOKEN"
```

**Legacy (Deprecado):**
```bash
curl -X GET http://localhost/api/battle-pass/player-1 \
  -H "Authorization: Bearer TOKEN"
```

### Agregar Experiencia

**v1:**
```bash
curl -X POST http://localhost/api/v1/battle-pass/experience \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","experience":50}'
```

**Legacy (Deprecado):**
```bash
curl -X POST http://localhost/api/battle-pass/experience \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","experience":50}'
```

## 🎁 Battle Pass Rewards Endpoints

### Listar Todos los Rewards (Público - Sin autenticación)

```bash
curl -X GET http://localhost/api/battle-pass-reward
```

### Crear Reward

```bash
curl -X POST http://localhost/api/battle-pass-reward \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "level": 11,
    "reward": { "type": "gold", "body": { "amount": 200 } }
  }'
```

### Actualizar Reward

```bash
curl -X PUT http://localhost/api/battle-pass-reward/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reward": { "type": "powerup", "body": { "powerup": "joker", "quantity": 2 } }
  }'
```

### Eliminar Reward

```bash
curl -X DELETE http://localhost/api/battle-pass-reward/1 \
  -H "Authorization: Bearer TOKEN"
```

### Tipos de Rewards Válidos

**Gold (Dinero):**
```json
{ "type": "gold", "body": { "amount": 100 } }
```

**Foto de Perfil:**
```json
{ "type": "profilePicture", "body": { "id": 1 } }
```

**Fondo de Perfil:**
```json
{ "type": "profileBackground", "body": { "id": 1 } }
```

**Avatar de Perfil:**
```json
{ "type": "profileAvatar", "body": { "id": 1 } }
```

**Power-up:**
```json
{ "type": "powerup", "body": { "powerup": "POWERUP_JOKER", "quantity": 10 } }
```

## 🏆 Player Rewards Endpoints

### Listar Rewards del Jugador

```bash
curl -X GET http://localhost/api/player-reward/player-1 \
  -H "Authorization: Bearer TOKEN"
```

### Listar Rewards No Reclamados

```bash
curl -X GET http://localhost/api/player-reward/player-1/unclaimed \
  -H "Authorization: Bearer TOKEN"
```

### Reclamar Reward (por Nivel)

```bash
curl -X POST http://localhost/api/player-reward/claim \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","level":1}'
```

### Otorgar Reward (por Nivel)

```bash
curl -X POST http://localhost/api/player-reward/award \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","level":2}'
```

## 📊 Casos de Uso Completos

### Caso 1: Crear Jugador, Login y Agregar Experiencia

```bash
# 1. Login (crea el jugador si no existe o genera token)
TOKEN=$(curl -s -X POST http://localhost/api/v1/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Obtener detalles del jugador
curl -X GET http://localhost/api/v1/player/id/player-1 \
  -H "Authorization: Bearer $TOKEN"

# 3. Agregar experiencia
curl -X POST http://localhost/api/v1/battle-pass/experience \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","experience":500}'

# 4. Ver battle pass actualizado
curl -X GET http://localhost/api/v1/battle-pass/player-1 \
  -H "Authorization: Bearer $TOKEN"
```

### Caso 2: Verificar Disponibilidad y Actualizar Nickname

```bash
# 1. Validar que el nickname está disponible
curl -X GET http://localhost/api/v1/player/validate/NewNickname

# 2. Actualizar el nickname (requiere token)
TOKEN="tu_jwt_token_aqui"
curl -X PUT http://localhost/api/v1/player/nickname/player-1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nickname":"NewNickname"}'

# 3. Obtener el jugador actualizado
curl -X GET http://localhost/api/v1/player/id/player-1 \
  -H "Authorization: Bearer $TOKEN"
```

### Caso 3: Listar Rewards y Reclamar

```bash
TOKEN="tu_jwt_token_aqui"

# 1. Listar todos los rewards disponibles
curl -X GET http://localhost/api/battle-pass-reward

# 2. Ver rewards del jugador
curl -X GET http://localhost/api/player-reward/player-1 \
  -H "Authorization: Bearer $TOKEN"

# 3. Ver rewards no reclamados
curl -X GET http://localhost/api/player-reward/player-1/unclaimed \
  -H "Authorization: Bearer $TOKEN"

# 4. Reclamar un reward
curl -X POST http://localhost/api/player-reward/claim \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","level":1}'
```

## 🔧 Tips Útiles

### Extraer Token de la Respuesta
```bash
TOKEN=$(curl -s -X POST http://localhost/api/v1/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

### Guardar Token en Variable
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Usar Token en Requests Consecutivos
```bash
curl -X GET http://localhost/api/v1/player/id/player-1 \
  -H "Authorization: Bearer $TOKEN"
```

### Formatear JSON Response (requiere jq)
```bash
curl -s -X GET http://localhost/health | jq .
```

### Ver Headers de Respuesta
```bash
curl -i -X GET http://localhost/health
```

### Debug Request Completo
```bash
curl -v -X POST http://localhost/api/v1/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'
```

## 📚 Referencias

- [README.md](./README.md) - Documentación principal
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del proyecto
- [API_VERSIONING_GUIDE.md](./API_VERSIONING_GUIDE.md) - Guía de versionado de API
