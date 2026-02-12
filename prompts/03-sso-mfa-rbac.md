# PROMPT 03: SSO + MFA + RBAC (Autenticación Enterprise)

## POR QUÉ
Sin SSO/MFA/RBAC no podemos:
- Cobrar el plan Enterprise (las empresas EXIGEN SSO)
- Pasar auditorías SOC 2 (requiere MFA y control de acceso)
- Vender a clientes medianos+ (Active Directory/Okta es estándar)
Hoy Alqvimia solo tiene login básico con email+password. Gap vs competencia: UiPath=10, AA=9, BP=9, Alqvimia=4.

## PROMPT PARA CLAUDE

```
Implementa un sistema completo de autenticación enterprise para Alqvimia RPA con SSO, MFA y RBAC.

### CONTEXTO ACTUAL
- Auth actual: tabla `usuarios` con email + password (bcrypt hash)
- Login en: `src/views/LoginView.jsx`
- Auth context: `src/context/AuthContext.jsx`
- Backend auth: en `server/server.js` (inline, no separado)
- JWT tokens básicos sin refresh
- Sin roles ni permisos (todos son admin)

### DEPENDENCIAS NECESARIAS
```bash
npm install passport passport-saml passport-local passport-jwt
npm install otplib qrcode  # Para TOTP MFA
npm install jsonwebtoken    # Ya debería existir
```

### LO QUE DEBES CREAR

#### 1. SAML 2.0 SSO (`server/auth/sso.js`)

Soportar estos Identity Providers:
- **Azure Active Directory** (Microsoft Entra ID)
- **Okta**
- **Google Workspace**
- **OneLogin**
- **SAML 2.0 genérico** (cualquier IdP compatible)

Configuración por tenant (cada organización puede tener su propio IdP):
```javascript
// Tabla: sso_configurations
// tenant_id, provider, entry_point, issuer, cert, callback_url, enabled

// Flujo:
// 1. Usuario va a /login
// 2. Si su organización tiene SSO habilitado, redirige al IdP
// 3. IdP autentica y redirige a /api/auth/sso/callback
// 4. Backend valida SAML assertion
// 5. Busca/crea usuario en BD
// 6. Genera JWT y redirige al frontend
```

Rutas SSO:
```
GET  /api/auth/sso/:tenantSlug       → Inicia flujo SSO
POST /api/auth/sso/callback          → Callback del IdP
GET  /api/auth/sso/metadata/:tenant  → Metadata SP para configurar en IdP
```

#### 2. MFA con TOTP (`server/auth/mfa.js`)

```javascript
// Flujo de activación:
// 1. Usuario va a Settings → Seguridad → Activar MFA
// 2. Backend genera secret TOTP + QR code
// 3. Usuario escanea con Google Authenticator/Authy
// 4. Usuario ingresa código de 6 dígitos para confirmar
// 5. Se guardan recovery codes (10 códigos de un uso)

// Flujo de login con MFA:
// 1. Login normal (email+password) → responde {requiresMFA: true, tempToken}
// 2. Frontend muestra pantalla de código MFA
// 3. Usuario ingresa código → POST /api/auth/mfa/verify
// 4. Si válido, genera JWT completo
// 5. Si usa recovery code, marcarlo como usado
```

Rutas MFA:
```
POST /api/auth/mfa/setup          → Generar secret + QR
POST /api/auth/mfa/verify-setup   → Confirmar activación con primer código
POST /api/auth/mfa/verify         → Verificar código en login
POST /api/auth/mfa/disable        → Desactivar MFA (requiere password)
GET  /api/auth/mfa/recovery-codes → Obtener recovery codes (solo una vez)
```

Tabla:
```sql
CREATE TABLE user_mfa (
    user_id INT PRIMARY KEY REFERENCES usuarios(id),
    secret VARCHAR(255) NOT NULL,  -- Encriptado
    enabled BOOLEAN DEFAULT FALSE,
    recovery_codes JSON,  -- Array de códigos hasheados
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. RBAC - Roles y Permisos (`server/auth/rbac.js`)

Roles predefinidos:
```javascript
const ROLES = {
  owner: {
    name: 'Owner',
    description: 'Dueño de la organización, acceso total',
    permissions: ['*']  // Todo
  },
  admin: {
    name: 'Administrador',
    description: 'Gestión de usuarios y configuración',
    permissions: [
      'workflows:*', 'executions:*', 'users:read', 'users:create',
      'users:update', 'settings:read', 'settings:update',
      'credentials:*', 'scheduler:*', 'analytics:*'
    ]
  },
  developer: {
    name: 'Desarrollador',
    description: 'Crear y editar workflows',
    permissions: [
      'workflows:read', 'workflows:create', 'workflows:update',
      'workflows:execute', 'executions:read', 'credentials:read',
      'scheduler:read', 'analytics:read', 'library:*'
    ]
  },
  operator: {
    name: 'Operador',
    description: 'Ejecutar workflows y ver resultados',
    permissions: [
      'workflows:read', 'workflows:execute',
      'executions:read', 'analytics:read', 'scheduler:read'
    ]
  },
  viewer: {
    name: 'Visualizador',
    description: 'Solo lectura',
    permissions: [
      'workflows:read', 'executions:read', 'analytics:read'
    ]
  }
};
```

Middleware de permisos:
```javascript
// Uso en rutas:
router.post('/api/workflows',
  authMiddleware,          // Verifica JWT
  tenantMiddleware,        // Extrae tenantId
  requirePermission('workflows:create'),  // Verifica permiso
  createWorkflow
);

router.delete('/api/workflows/:id',
  authMiddleware,
  tenantMiddleware,
  requirePermission('workflows:delete'),
  deleteWorkflow
);
```

#### 4. JWT mejorado con refresh tokens

```javascript
// Access token: corta duración (15 min)
// Refresh token: larga duración (7 días), guardado en httpOnly cookie

// Payload del JWT:
{
  userId: 123,
  email: 'user@company.com',
  tenantId: 'org-uuid',
  role: 'developer',
  permissions: ['workflows:read', 'workflows:create', ...],
  mfaVerified: true
}

// Rutas:
POST /api/auth/login         → Email+password → accessToken + refreshToken
POST /api/auth/refresh       → Refresh token → nuevo accessToken
POST /api/auth/logout        → Invalidar refresh token
GET  /api/auth/me            → Info del usuario actual
```

#### 5. Frontend: Pantallas nuevas

En `src/views/LoginView.jsx` agregar:
- Botón "Login con SSO" (si la organización tiene SSO)
- Pantalla de código MFA (después del login)
- Link a "Forgot Password"

En `src/views/SettingsView.jsx` agregar sección:
- **Seguridad**: Activar/desactivar MFA, ver recovery codes
- **SSO**: Configurar IdP (solo owner/admin)
- **Usuarios**: Gestión de miembros, roles, invitaciones

#### 6. Migración de base de datos (`server/migrations/009_auth_enterprise.sql`)

```sql
-- SSO configurations por tenant
CREATE TABLE sso_configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36) REFERENCES organizations(id),
    provider ENUM('azure_ad','okta','google','onelogin','saml_generic') NOT NULL,
    entry_point VARCHAR(500) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    certificate TEXT NOT NULL,
    callback_url VARCHAR(500) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    metadata_xml TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_tenant_provider (tenant_id, provider)
);

-- MFA
CREATE TABLE user_mfa (
    user_id INT PRIMARY KEY REFERENCES usuarios(id),
    secret_encrypted VARCHAR(500) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    recovery_codes JSON,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id INT REFERENCES usuarios(id),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_tokens (user_id),
    INDEX idx_token_hash (token_hash)
);

-- Invitaciones
CREATE TABLE user_invitations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id VARCHAR(36) REFERENCES organizations(id),
    email VARCHAR(255) NOT NULL,
    role ENUM('admin','developer','operator','viewer') DEFAULT 'developer',
    invited_by INT REFERENCES usuarios(id),
    accepted BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar campos a usuarios
ALTER TABLE usuarios ADD COLUMN role ENUM('owner','admin','developer','operator','viewer') DEFAULT 'developer';
ALTER TABLE usuarios ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN last_login TIMESTAMP NULL;
ALTER TABLE usuarios ADD COLUMN login_count INT DEFAULT 0;
```

### RESTRICCIONES
- NO romper el login actual (email+password sigue funcionando)
- SSO es OPCIONAL por tenant, no obligatorio
- MFA es OPCIONAL por usuario
- El owner siempre puede hacer todo, NUNCA bloquearlo
- Passwords: mínimo 8 chars, 1 mayúscula, 1 número
- Refresh tokens: httpOnly, secure, sameSite strict
- Recovery codes: hasheados, single-use
- NUNCA loggear passwords ni secrets MFA

### CRITERIOS DE ÉXITO
1. Login con email+password sigue funcionando
2. Configurar SSO con Azure AD y login exitoso
3. Activar MFA, escanear QR, login con código TOTP
4. Un developer NO puede eliminar workflows (solo admin/owner)
5. Un viewer NO puede ejecutar workflows
6. Refresh token renueva el access token sin re-login
7. Recovery code funciona cuando se pierde el teléfono MFA
```
