# 🚀 Guía de Versionado de API

## 📋 **Cómo Crear una Nueva Versión de API**

Esta guía te muestra cómo implementar una nueva versión de API (ejemplo: v2) manteniendo compatibilidad con versiones anteriores.

## 🏗️ **Estructura para Nueva Versión**

### **1. Crear Entidades Mejoradas**
```javascript
// src/entities/v2/PlayerV2.js
class PlayerV2 {
  constructor(playerId, nickname, email, avatar, preferences) {
    // Nuevos campos para v2
    this.email = email;
    this.avatar = avatar;
    this.preferences = preferences;
    this.statistics = { /* ... */ };
  }
  
  // Nuevos métodos de validación
  static validateEmail(email) { /* ... */ }
  static validateAvatar(avatar) { /* ... */ }
}
```

### **2. Crear Servicios Mejorados**
```javascript
// src/services/v2/AuthServiceV2.js
class AuthServiceV2 {
  generateTokenPair(payload) {
    // Nuevo sistema de refresh tokens
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }
}
```

### **3. Crear Casos de Uso Mejorados**
```javascript
// src/useCases/v2/player/LoginPlayerV2UseCase.js
class LoginPlayerV2UseCase {
  async execute(playerId, email) {
    // Lógica mejorada con nuevos campos
    const tokens = this.authServiceV2.generateTokenPair(payload);
    return { success: true, data: { player, authentication: tokens } };
  }
}
```

### **4. Crear Controladores Mejorados**
```javascript
// src/controllers/v2/PlayerV2Controller.js
class PlayerV2Controller {
  login = async (req, res) => {
    // Nuevos endpoints con funcionalidad mejorada
  };
}
```

### **5. Crear Middlewares Específicos**
```javascript
// src/middlewares/v2/AuthV2Middleware.js
class AuthV2Middleware {
  handleTokenRefresh = (req, res, next) => {
    // Manejo de refresh tokens
  };
}
```

## 🔧 **Configuración del Sistema**

### **1. Actualizar DependencyContainer**
```javascript
// src/config/DependencyContainer.js
class DependencyContainer {
  initialize() {
    // Agregar servicios v2
    this.services.authServiceV2 = new AuthServiceV2();
    
    // Agregar controladores v2
    this.controllers.playerV2Controller = new PlayerV2Controller(/* ... */);
  }
}
```

### **2. Actualizar Middleware de Versionado**
```javascript
// src/middlewares/ApiVersionMiddleware.js
static getSupportedVersions() {
  return {
    current: 'v2',           // Nueva versión actual
    supported: ['v1', 'v2'], // Agregar v2
    deprecated: [],
    legacy: true
  };
}

static handleVersion(req, res, next) {
  switch (version) {
    case 'v2':               // Agregar caso v2
      req.apiVersion = 'v2';
      req.apiVersionNumber = 2;
      break;
    // ... otros casos
  }
}
```

### **3. Agregar Rutas en index.js**
```javascript
// index.js

// API Version 2 Routes
const v2Router = express.Router();

v2Router.post('/player/login', 
  ValidationMiddleware.validatePlayerData,
  container.getController('playerV2Controller').login
);

v2Router.post('/player/refresh',
  authV2Middleware.validateRefreshToken,
  container.getController('playerV2Controller').refreshToken
);

// Mount v2 routes
app.use('/api/v2', v2Router);
```

## 📊 **Ejemplo Completo: API v2**

### **Nuevas Funcionalidades en v2:**
- ✅ **Perfiles mejorados**: email, avatar, preferencias
- ✅ **Autenticación avanzada**: refresh tokens, sesiones
- ✅ **Estadísticas de jugador**: tiempo de juego, logros
- ✅ **Sistema de preferencias**: tema, idioma, notificaciones
- ✅ **Validaciones mejoradas**: email, URLs de avatar
- ✅ **Headers informativos**: expiración de tokens

### **Endpoints v2:**
```
POST /api/v2/player/login          # Login con refresh tokens
POST /api/v2/player                # Crear jugador con perfil completo
POST /api/v2/player/refresh        # Refrescar access token
GET  /api/v2/player/profile        # Obtener perfil completo
```

### **Compatibilidad:**
- ✅ **v1**: Sigue funcionando sin cambios
- ✅ **Legacy**: Mantiene compatibilidad total
- ✅ **Migración gradual**: Los clientes pueden migrar cuando quieran

## 🎯 **Estrategia de Migración**

### **Fase 1: Desarrollo**
1. Crear entidades, servicios y controladores v2
2. Implementar tests para v2
3. Documentar nuevas funcionalidades

### **Fase 2: Lanzamiento**
1. Deploy v2 junto con v1
2. Actualizar documentación
3. Notificar a clientes sobre v2

### **Fase 3: Migración**
1. Clientes migran gradualmente a v2
2. Monitorear uso de v1 vs v2
3. Proporcionar soporte durante transición

### **Fase 4: Deprecación (Futuro)**
1. Anunciar deprecación de v1
2. Establecer fecha límite
3. Remover v1 después del período de gracia

## 📝 **Mejores Prácticas**

### **1. Mantener Compatibilidad**
- ✅ Nunca romper endpoints existentes
- ✅ Agregar funcionalidad, no remover
- ✅ Usar versionado semántico

### **2. Documentación Clara**
- ✅ Documentar todas las versiones
- ✅ Explicar diferencias entre versiones
- ✅ Proporcionar guías de migración

### **3. Testing Exhaustivo**
- ✅ Tests para cada versión
- ✅ Tests de compatibilidad
- ✅ Tests de migración

### **4. Monitoreo**
- ✅ Trackear uso por versión
- ✅ Monitorear errores por versión
- ✅ Métricas de adopción

## 🔄 **Ejemplo de Uso**

### **Crear Jugador v2:**
```bash
curl -X POST http://localhost:8080/api/v2/player \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player123",
    "nickname": "PlayerOne",
    "email": "player@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "preferences": {
      "theme": "dark",
      "language": "en",
      "notifications": true
    },
    "key": "your_api_key"
  }'
```

### **Login v2:**
```bash
curl -X POST http://localhost:8080/api/v2/player/login \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player123",
    "email": "player@example.com"
  }'
```

### **Refrescar Token:**
```bash
curl -X POST http://localhost:8080/api/v2/player/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token"
  }'
```

## 🎉 **Resultado**

Con esta implementación tienes:
- ✅ **v2**: Versión actual con funcionalidades avanzadas
- ✅ **v1**: Versión estable mantenida
- ✅ **Legacy**: Compatibilidad total
- ✅ **Migración gradual**: Sin interrupciones
- ✅ **Documentación completa**: Para todas las versiones

¡Tu API puede evolucionar sin romper integraciones existentes! 🚀
