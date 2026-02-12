# PROMPT 05: Audit Trail Inmutable

## POR QUÉ
Para SOC 2 y compliance enterprise, necesitamos un registro inmutable de TODA acción realizada en el sistema. Esto es lo que permite:
- Pasar auditorías SOC 2 Type 2 (control CC6.1: audit logging)
- Responder "quién hizo qué, cuándo y desde dónde"
- Detectar accesos no autorizados
- Cumplir GDPR (derecho a saber qué datos se accedieron)
Gap: UiPath=9, AA=8, Blue Prism=10 (el mejor), Alqvimia=4.

## PROMPT PARA CLAUDE

```
Implementa un sistema de audit trail inmutable para Alqvimia RPA.

### CONTEXTO ACTUAL
- Backend Node.js/Express con middleware de auth y tenant
- Las acciones del usuario no se registran más allá de console.log
- No hay tabla de auditoría

### LO QUE DEBES CREAR

#### 1. Tabla de audit logs (`server/migrations/011_audit_trail.sql`)

```sql
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    user_id INT NULL,  -- NULL para acciones del sistema
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    resource_name VARCHAR(255),
    details JSON,  -- Datos adicionales según la acción
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    session_id VARCHAR(100),
    status ENUM('success','failure','denied') DEFAULT 'success',
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3),  -- Milliseconds
    INDEX idx_tenant_date (tenant_id, created_at),
    INDEX idx_user_date (user_id, created_at),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_action (action)
) ENGINE=InnoDB;

-- Particionamiento por mes para performance
-- ALTER TABLE audit_logs PARTITION BY RANGE (UNIX_TIMESTAMP(created_at)) (...);
```

#### 2. Servicio de auditoría (`server/services/auditService.js`)

```javascript
// TODA acción que se audita pasa por aquí

const AUDIT_ACTIONS = {
  // Auth
  'auth.login': 'Usuario inició sesión',
  'auth.login.failed': 'Intento de login fallido',
  'auth.logout': 'Usuario cerró sesión',
  'auth.mfa.enabled': 'MFA activado',
  'auth.mfa.disabled': 'MFA desactivado',
  'auth.password.changed': 'Contraseña cambiada',
  'auth.sso.configured': 'SSO configurado',

  // Workflows
  'workflow.created': 'Workflow creado',
  'workflow.updated': 'Workflow modificado',
  'workflow.deleted': 'Workflow eliminado',
  'workflow.executed': 'Workflow ejecutado',
  'workflow.execution.completed': 'Ejecución completada',
  'workflow.execution.failed': 'Ejecución fallida',

  // Users
  'user.created': 'Usuario creado',
  'user.updated': 'Usuario modificado',
  'user.deleted': 'Usuario eliminado',
  'user.role.changed': 'Rol de usuario cambiado',
  'user.invited': 'Usuario invitado',

  // Organization
  'org.settings.updated': 'Configuración actualizada',
  'org.plan.changed': 'Plan cambiado',
  'org.sso.updated': 'Configuración SSO actualizada',

  // Credentials
  'credential.created': 'Credencial creada',
  'credential.accessed': 'Credencial accedida',
  'credential.updated': 'Credencial actualizada',
  'credential.deleted': 'Credencial eliminada',

  // Admin
  'admin.export.data': 'Datos exportados',
  'admin.api_key.created': 'API Key creada',
  'admin.api_key.revoked': 'API Key revocada',
};

class AuditService {
  async log({ tenantId, userId, userEmail, action, resourceType, resourceId, resourceName, details, req, status = 'success' }) {
    // NUNCA incluir passwords, tokens o datos sensibles en details
    const sanitizedDetails = this.sanitize(details);

    await db.query(
      `INSERT INTO audit_logs (tenant_id, user_id, user_email, action, resource_type, resource_id, resource_name, details, ip_address, user_agent, session_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, userId, userEmail, action, resourceType, resourceId, resourceName,
       JSON.stringify(sanitizedDetails),
       req?.ip || req?.headers?.['x-forwarded-for'],
       req?.headers?.['user-agent'],
       req?.sessionId,
       status]
    );
  }

  sanitize(details) {
    if (!details) return null;
    const sensitive = ['password', 'secret', 'token', 'key', 'credential', 'authorization'];
    const cleaned = { ...details };
    for (const key of Object.keys(cleaned)) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        cleaned[key] = '***REDACTED***';
      }
    }
    return cleaned;
  }
}
```

#### 3. Middleware de auditoría (`server/middleware/audit.js`)

```javascript
// Middleware que audita automáticamente las rutas que lo usen
export function auditAction(action, resourceType) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function(data) {
      // Auditar DESPUÉS de que la acción se completó
      auditService.log({
        tenantId: req.tenantId,
        userId: req.user?.id,
        userEmail: req.user?.email,
        action,
        resourceType,
        resourceId: req.params.id || data?.id,
        resourceName: data?.nombre || data?.name,
        details: { method: req.method, path: req.path, statusCode: res.statusCode },
        req,
        status: res.statusCode < 400 ? 'success' : 'failure'
      });

      return originalJson(data);
    };

    next();
  };
}

// Uso en rutas:
router.post('/api/workflows',
  authMiddleware,
  tenantMiddleware,
  requirePermission('workflows:create'),
  auditAction('workflow.created', 'workflow'),
  createWorkflow
);
```

#### 4. API de consulta de audit logs

```javascript
// GET /api/audit-logs?action=workflow.executed&from=2026-02-01&to=2026-02-28&userId=5
// Solo accesible por owner/admin
router.get('/api/audit-logs',
  requirePermission('audit:read'),
  async (req, res) => {
    const { action, resourceType, userId, from, to, page = 1, limit = 50 } = req.query;
    // Construir query con filtros
    // Siempre filtrar por tenant_id
    // Paginación obligatoria (no permitir exportar todo sin límite)
  }
);

// GET /api/audit-logs/export  → Export CSV para auditores externos
// GET /api/audit-logs/stats   → Resumen: acciones por día, usuarios más activos, fallos
```

#### 5. Frontend: Vista de Audit Logs

Agregar en `AdminDashboard` o como vista separada:
- Tabla paginada con filtros (acción, usuario, fecha, recurso)
- Búsqueda por texto libre
- Export a CSV
- Timeline visual de acciones recientes
- Alertas: logins fallidos, accesos a credenciales, eliminaciones

#### 6. Data masking para campos sensibles

En los audit logs, NUNCA almacenar:
- Passwords (ni siquiera hasheados)
- API keys completas (solo últimos 4 chars: `***abc1`)
- Tokens JWT
- Credenciales de terceros
- Datos PII completos (enmascarar email: `u***@company.com`)

### RESTRICCIONES
- Los audit logs son INMUTABLES: no hay UPDATE ni DELETE
- Retention policy: configurable por tenant (default 90 días)
- Solo owner/admin pueden ver audit logs
- Performance: insert async (no bloquear la request principal)
- Índices para queries frecuentes (por tenant+fecha, por usuario)
- NUNCA loggear datos sensibles

### CRITERIOS DE ÉXITO
1. Login exitoso genera un audit log con IP, user-agent, timestamp
2. Login fallido genera un audit log con status 'failure'
3. Crear/editar/eliminar workflow genera audit log
4. Ejecución de workflow registrada con duración y resultado
5. Acceso a credenciales registrado
6. Vista de admin muestra timeline de auditoría filtrable
7. Export a CSV funciona para auditores externos
8. Passwords y tokens NUNCA aparecen en los logs
```
