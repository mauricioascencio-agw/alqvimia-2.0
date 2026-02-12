# PROMPT 02: Sistema Multi-Tenancy

## POR QUÉ
Alqvimia será un SaaS con cobro. Cada cliente (organización) es un "tenant" que debe tener sus datos completamente aislados. Sin multi-tenancy no podemos:
- Cobrar por organización/plan
- Garantizar que los datos de un cliente no se filtren a otro
- Ofrecer white-label en el futuro
- Cumplir con SOC 2 / GDPR (aislamiento de datos)

## PROMPT PARA CLAUDE

```
Necesito que implementes un sistema de multi-tenancy para Alqvimia RPA. El producto será un SaaS con cobro donde cada organización es un tenant aislado.

### CONTEXTO ACTUAL
- Backend: Node.js/Express en `server/`
- Base de datos: MySQL con las tablas actuales (users, workflows, etc.)
- Auth actual: login simple con bcrypt en tabla `usuarios`
- API routes en: `server/routes/workflows.js`, `server/routes/ai.js`, etc.
- Database service: `server/services/database.js` usa mysql2 con pool

### ESTRATEGIA DE AISLAMIENTO
Usar **Row-Level Security** (filtrado por `tenant_id` en cada query) con una columna `tenant_id` en TODAS las tablas que contienen datos de usuario. NO bases de datos separadas por tenant (demasiado complejo para esta etapa).

### LO QUE DEBES CREAR

#### 1. Migración de base de datos (`server/migrations/008_multi_tenancy.sql`)

```sql
-- Tabla de organizaciones (tenants)
CREATE TABLE organizations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan ENUM('trial','starter','professional','business','enterprise') DEFAULT 'trial',
    status ENUM('active','suspended','cancelled','trial') DEFAULT 'trial',
    settings JSON DEFAULT '{}',
    max_users INT DEFAULT 3,
    max_workflows INT DEFAULT 5,
    max_executions_month INT DEFAULT 1000,
    trial_ends_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Agregar tenant_id a tabla usuarios
ALTER TABLE usuarios ADD COLUMN tenant_id VARCHAR(36) REFERENCES organizations(id);
ALTER TABLE usuarios ADD COLUMN role ENUM('owner','admin','developer','operator','viewer') DEFAULT 'developer';

-- Agregar tenant_id a workflows
ALTER TABLE workflows ADD COLUMN tenant_id VARCHAR(36) REFERENCES organizations(id);

-- Agregar tenant_id a TODAS las tablas de datos
-- (repetir para cada tabla existente que contenga datos de usuario)

-- Índices para performance
CREATE INDEX idx_workflows_tenant ON workflows(tenant_id);
CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);

-- Crear organización default para datos existentes
INSERT INTO organizations (id, name, slug, plan, status)
VALUES ('default-org', 'Default Organization', 'default', 'enterprise', 'active');

-- Migrar datos existentes al tenant default
UPDATE usuarios SET tenant_id = 'default-org' WHERE tenant_id IS NULL;
UPDATE workflows SET tenant_id = 'default-org' WHERE tenant_id IS NULL;
```

#### 2. Middleware de Tenant (`server/middleware/tenant.js`)

```javascript
// Este middleware se ejecuta en CADA request autenticado
// Extrae el tenant_id del JWT token y lo inyecta en req.tenantId
// TODAS las queries de la DB deben filtrar por este tenantId

export function tenantMiddleware(req, res, next) {
  // El tenant viene del JWT token (puesto en login)
  if (!req.user || !req.user.tenantId) {
    return res.status(403).json({ error: 'Tenant not identified' });
  }
  req.tenantId = req.user.tenantId;
  next();
}

// Middleware de límites por plan
export async function planLimitsMiddleware(req, res, next) {
  // Verificar que el tenant no exceda los límites de su plan
  // ej: max_workflows, max_executions_month, max_users
}
```

#### 3. Database Service con tenant scoping (`server/services/database.js`)

Modificar el servicio de base de datos para que SIEMPRE filtre por tenant_id.

Crear un wrapper:
```javascript
class TenantDB {
  constructor(tenantId) {
    this.tenantId = tenantId;
  }

  // Todas las queries incluyen WHERE tenant_id = ?
  async query(sql, params = []) {
    // Inyectar tenant_id automáticamente
  }

  // Helpers con tenant automático
  async getWorkflows() {
    return this.query('SELECT * FROM workflows WHERE tenant_id = ?', [this.tenantId]);
  }

  async createWorkflow(data) {
    return this.query(
      'INSERT INTO workflows (nombre, contenido, tenant_id) VALUES (?, ?, ?)',
      [data.nombre, data.contenido, this.tenantId]
    );
  }
  // ... más métodos
}

// Factory que se usa en cada request
export function getTenantDB(req) {
  return new TenantDB(req.tenantId);
}
```

#### 4. Registro de organizaciones (`server/routes/organizations.js`)

```javascript
// POST /api/organizations - Crear nueva organización (signup SaaS)
// GET /api/organizations/me - Mi organización actual
// PUT /api/organizations/me - Actualizar mi organización
// GET /api/organizations/me/usage - Uso actual (workflows, ejecuciones, storage)
// GET /api/organizations/me/members - Miembros de la organización
// POST /api/organizations/me/invite - Invitar miembro
// DELETE /api/organizations/me/members/:id - Remover miembro
```

#### 5. Flujo de Signup SaaS

Cuando un nuevo usuario se registra:
1. Crear organización nueva con plan 'trial'
2. Crear usuario como 'owner' de esa organización
3. Configurar trial de 14 días (trial_ends_at)
4. Enviar email de bienvenida
5. Redirigir a onboarding wizard

#### 6. Actualizar TODAS las rutas existentes

Cada ruta en `server/routes/workflows.js` y otros archivos debe:
- Usar `req.tenantId` para filtrar datos
- NUNCA devolver datos de otro tenant
- Verificar límites del plan antes de crear recursos

Ejemplo de migración de una ruta existente:
```javascript
// ANTES:
router.get('/api/workflows', async (req, res) => {
  const workflows = await db.query('SELECT * FROM workflows');
  res.json(workflows);
});

// DESPUÉS:
router.get('/api/workflows', tenantMiddleware, async (req, res) => {
  const tenantDB = getTenantDB(req);
  const workflows = await tenantDB.getWorkflows();
  res.json(workflows);
});
```

### RESTRICCIONES
- NO crear bases de datos separadas por tenant (demasiado costoso)
- SIEMPRE filtrar por tenant_id, NUNCA queries sin filtro
- El tenant_id viene del JWT, NUNCA del query string o body
- Los datos existentes deben migrar al tenant 'default-org' sin romperse
- El frontend NO debe cambiar (el tenant es transparente, viene del token)
- Cada usuario pertenece a exactamente 1 organización
- El owner no se puede eliminar a sí mismo

### CRITERIOS DE ÉXITO
1. Crear 2 organizaciones distintas
2. Cada una ve SOLO sus workflows
3. Un usuario de org-A NO puede ver datos de org-B
4. Los límites del plan se enforcement (no crear más de X workflows en plan starter)
5. El signup crea organización + usuario owner + trial
6. Datos existentes migrados sin pérdida al tenant default
```
