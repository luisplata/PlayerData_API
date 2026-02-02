# ❓ Por qué POST /api/v1/player devuelve 401 Unauthorized

## 🎯 Respuesta Corta

**NO es un endpoint público**, requiere autenticación con **PLAYER_API_KEY**.

## 📝 Lo que Necesitas

Para usar `POST /api/v1/player`, debes:

1. Tener la `PLAYER_API_KEY` configurada en variables de entorno del servidor
2. Enviarla en el body del request con el campo `key`

### ✅ Forma Correcta:

```bash
# Con API Key
curl -X POST http://localhost/api/v1/player \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player-1",
    "nickname": "Alice",
    "key": "tu_PLAYER_API_KEY"
  }'
```

## 🔄 Alternativa Recomendada

**¿Por qué complicarse?** Usa el endpoint de **LOGIN que SÍ es público**:

```bash
# Este SÍ funciona sin API Key
curl -X POST http://localhost/api/v1/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'
```

Esto devuelve:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "player": {
      "playerId": "player-1",
      "nickname": "DefaultNickname"
    }
  }
}
```

## 📊 Comparación de Endpoints

| Endpoint | Método | Autenticación | ¿Público? | Recomendado |
|----------|--------|---------------|-----------|-------------|
| `/api/v1/player` | `POST` | API Key | ❌ No | ⏬ Para admins |
| `/api/v1/player/login` | `POST` | Ninguna | ✅ Sí | ⭐ Mejor opción |
| `/api/v2/player` | `POST` | Ninguna | ✅ Sí | ✅ También bueno |
| `/api/v2/player/login` | `POST` | Ninguna | ✅ Sí | ✅ Con refresh tokens |

## 🔐 ¿Cuándo Usar Cada Uno?

### Si Eres Usuario/Cliente
Usa **LOGIN** (público):
```bash
curl -X POST http://localhost/api/v1/player/login \
  -H "Content-Type: application/json" \
  -d '{"playerId":"mi-usuario"}'
```

### Si Eres Administrador
Usa **POST /api/v1/player** con tu API Key:
```bash
curl -X POST http://localhost/api/v1/player \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "admin-user",
    "nickname": "Admin",
    "key": "mi_api_key_segura"
  }'
```

### Si Quieres lo Más Simple
Usa **v2** que es completamente público:
```bash
curl -X POST http://localhost/api/v2/player \
  -H "Content-Type: application/json" \
  -d '{"playerId":"usuario","nickname":"Alias"}'
```

## 🔑 ¿De Dónde Saco la PLAYER_API_KEY?

La API Key está configurada en el archivo `.env` del servidor:

```env
PLAYER_API_KEY=tu_clave_super_secreta_aqui
```

**Necesitas acceso al servidor para obtenerla.** Si no tienes acceso, pide la clave al administrador del servidor.

## ✨ Resumen

| Necesidad | Endpoint | Solución |
|-----------|----------|----------|
| Crear usuario sin API Key | - | Usa `/api/v1/player/login` (es público) |
| Crear usuario siendo admin | `/api/v1/player` | Necesitas `PLAYER_API_KEY` |
| Versión más simple | - | Usa `/api/v2/player` |

**👉 Mi recomendación:** Para desarrollo y pruebas, **siempre usa login** que es público y mucho más simple.

---

📖 Para más detalles, ver [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)
