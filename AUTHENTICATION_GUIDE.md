# Guía de Autenticación - PlayerData API

## 🔐 Tipos de Autenticación

La API PlayerData utiliza **3 tipos de autenticación**:

### 1️⃣ **Endpoints Públicos** (Sin autenticación)
Puedes acceder sin ninguna credencial:

```bash
# Health check
curl http://localhost/health

# Validar nickname
curl http://localhost/api/v1/player/validate/MyNickname

# Listar rewards (público)
curl http://localhost/api/battle-pass-reward
```

### 2️⃣ **Autenticación JWT** (Con Token)
Requieren un JWT obtenido mediante login:

```bash
# Paso 1: Login para obtener token
TOKEN=$(curl -s -X POST http://localhost/api/v1/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Paso 2: Usar el token en requests
curl -X GET http://localhost/api/v1/player/id/player-1 \
  -H "Authorization: Bearer $TOKEN"
```

### 3️⃣ **Autenticación con API Key** (Para administradores)
Requieren `PLAYER_API_KEY` configurada en variables de entorno:

```bash
# Crear jugador directamente (requiere API Key)
API_KEY="tu_PLAYER_API_KEY"
curl -X POST http://localhost/api/v1/player \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1","nickname":"Alice","key":"'$API_KEY'"}'
```

## 📋 Endpoints por Tipo de Autenticación

### ✅ Endpoints Públicos (Recomendado para inicio)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/player/login` | Login v1 | ❌ No |
| `POST` | `/api/v2/player/login` | Login v2 con refresh | ❌ No |
| `GET` | `/api/v1/player/validate/:nickname` | Validar nickname | ❌ No |
| `GET` | `/api/battle-pass-reward` | Listar rewards | ❌ No |
| `GET` | `/health` | Health check | ❌ No |
| `GET` | `/api/versions` | Info de versiones | ❌ No |

### 🔓 Endpoints con JWT (Requiere Login primero)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/api/v1/player/id/:playerId` | Obtener jugador por ID | 🔐 JWT |
| `GET` | `/api/v1/player/:nickname` | Obtener por nickname | 🔐 JWT |
| `PUT` | `/api/v1/player/nickname/:playerId` | Actualizar nickname | 🔐 JWT |
| `GET` | `/api/v1/battle-pass/:playerId` | Obtener battle pass | 🔐 JWT |
| `POST` | `/api/v1/battle-pass/experience` | Agregar experiencia | 🔐 JWT |
| `GET` | `/api/v2/player/profile` | Obtener perfil v2 | 🔐 JWT |
| `GET` | `/api/player-reward/:playerId` | Listar rewards del jugador | 🔐 JWT |

### 🔑 Endpoints con API Key (Administración)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/player` | Crear jugador v1 | 🔑 API Key |
| `POST` | `/api/player` | Crear jugador legacy | 🔑 API Key |

> ℹ️ **Nota:** `/api/v2/player` (v2) **NO requiere API Key** - es público

## 🚀 Flujo Recomendado

### Para Usuarios Finales

```bash
# 1. Login (obtiene token JWT)
LOGIN_RESPONSE=$(curl -s -X POST http://localhost/api/v1/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId":"mi-jugador-001"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Usar el token en todos los requests posteriores
curl -X GET http://localhost/api/v1/player/id/mi-jugador-001 \
  -H "Authorization: Bearer $TOKEN"

# 3. Agregar experiencia
curl -X POST http://localhost/api/v1/battle-pass/experience \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"playerId":"mi-jugador-001","experience":500}'
```

### Para Administradores

```bash
# 1. Obtener API Key de variables de entorno
API_KEY=$(echo $PLAYER_API_KEY)

# 2. Crear jugador con API Key
curl -X POST http://localhost/api/v1/player \
  -H "Content-Type: application/json" \
  -d '{"playerId":"admin-player","nickname":"AdminUser","key":"'$API_KEY'"}'

# 3. O usar v2 que es público
curl -X POST http://localhost/api/v2/player \
  -H "Content-Type: application/json" \
  -d '{"playerId":"admin-player","nickname":"AdminUser"}'
```

## 🔄 JWT Tokens

### Estructura

Un JWT típico se ve así:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJJZCI6IlBMQVlFUjEyMyIsInNlc3Npb25JZCI6Imxsb2dpbiIsImlhdCI6MTcwMjEyMzQwMCwiZXhwIjoxNzAyMTI3MDAwfQ.abc123
```

Decodificado contiene:
```json
{
  "playerId": "PLAYER123",
  "sessionId": "login",
  "iat": 1702123400,    // Issued at (cuándo se creó)
  "exp": 1702127000     // Expiration (cuándo expira)
}
```

### Duración del Token

- **v1**: ~1 hora de validez
- **v2**: 
  - Access token: ~15 minutos
  - Refresh token: ~7 días (para renovar access token sin login nuevamente)

### Cómo Usar en Headers

```bash
# Forma correcta
curl -X GET http://localhost/api/v1/player/id/player-1 \
  -H "Authorization: Bearer eyJhbGc..."

# INCORRECTO (sin "Bearer")
curl -X GET http://localhost/api/v1/player/id/player-1 \
  -H "Authorization: eyJhbGc..."
```

## ⚙️ Variables de Entorno Requeridas

Para que la autenticación funcione, necesitas configurar en `.env`:

```env
# JWT Secret para firmar tokens
JWT_SECRET=tu_secret_muy_seguro_aqui

# API Key para crear jugadores como admin
PLAYER_API_KEY=tu_api_key_admin_aqui

# Base de datos
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password
MYSQL_DATABASE=playerdb
```

## 🐛 Troubleshooting

### Error: "Unauthorized" en POST /api/v1/player

**Causa:** No incluiste la API Key o es incorrecta

**Solución:** 
```bash
# Verifica que tienes la PLAYER_API_KEY correcta
curl -X POST http://localhost/api/v1/player \
  -H "Content-Type: application/json" \
  -d '{"playerId":"p1","nickname":"N","key":"API_KEY_CORRECTA"}'
```

O usa v2 que es público:
```bash
curl -X POST http://localhost/api/v2/player \
  -H "Content-Type: application/json" \
  -d '{"playerId":"p1","nickname":"N"}'
```

### Error: "Unauthorized" con Authorization Bearer

**Causa:** Token expirado o inválido

**Solución:**
```bash
# Haz login nuevamente para obtener un token nuevo
curl -X POST http://localhost/api/v1/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'
```

### Error: "Missing Authorization header"

**Causa:** No incluiste el header `Authorization`

**Solución:**
```bash
# Añade el header
curl -X GET http://localhost/api/v1/player/id/player-1 \
  -H "Authorization: Bearer TOKEN_AQUI"
```

## 📚 Referencias Útiles

- Ver todos los tipos de autenticación: `GET /api/versions`
- Documentación Swagger: `GET /api-docs`
- Verificar que API funciona: `GET /health`
