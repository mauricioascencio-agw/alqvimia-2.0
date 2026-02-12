# PROMPT 04: Orquestador v2 con BullMQ/Redis

## POR QUÉ
El orquestador actual es un scheduler básico. Para SaaS enterprise necesitamos:
- Colas de ejecución con prioridades (un cliente enterprise no espera detrás de un trial)
- Retry automático con backoff exponencial (resiliencia)
- Ejecución paralela de workflows (no secuencial)
- Triggers avanzados: webhook, file watcher, email, API call
- Monitoreo en tiempo real de la cola
- Dead letter queue para workflows que fallan repetidamente
Gap: UiPath=10, AA=9, BP=9, Alqvimia=5.

## PROMPT PARA CLAUDE

```
Implementa un orquestador avanzado para Alqvimia RPA usando BullMQ y Redis.

### CONTEXTO ACTUAL
- Existe `src/views/SchedulerView.jsx` con scheduling básico (cron)
- La ejecución de workflows es síncrona en el servidor
- No hay sistema de colas
- `server/routes/workflows.js` maneja ejecución directa
- Con el Prompt 01 ya se separó API y Worker con Docker

### DEPENDENCIAS
```bash
npm install bullmq ioredis cron
```

### LO QUE DEBES CREAR

#### 1. Colas BullMQ (`server/shared/queues.js`)

Definir las colas del sistema:
```javascript
import { Queue, QueueEvents } from 'bullmq';

// Cola principal: ejecución de workflows
export const executionQueue = new Queue('execution', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
});

// Cola de scheduling
export const schedulerQueue = new Queue('scheduler', { connection: redisConnection });

// Cola de notificaciones (email, webhook, push)
export const notificationQueue = new Queue('notification', { connection: redisConnection });

// Cola de cleanup/mantenimiento
export const maintenanceQueue = new Queue('maintenance', { connection: redisConnection });
```

#### 2. Worker de ejecución (`server/worker/executionWorker.js`)

```javascript
import { Worker } from 'bullmq';

const executionWorker = new Worker('execution', async (job) => {
  const { workflowId, tenantId, userId, params, priority } = job.data;

  // 1. Cargar workflow de la DB
  // 2. Verificar límites del tenant (max_executions_month)
  // 3. Crear registro de ejecución en DB (status: 'running')
  // 4. Ejecutar cada step del workflow secuencialmente
  //    - Por cada step: actualizar progreso (job.updateProgress)
  //    - Emitir eventos via Redis pub/sub para WebSocket
  //    - Si falla un step: decidir retry o fail según configuración
  // 5. Guardar resultado final en DB
  // 6. Emitir notificación de completado/fallido
  // 7. Actualizar métricas de uso del tenant

  return { status: 'completed', duration: elapsed, stepsRun: count };
}, {
  connection: redisConnection,
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
  limiter: {
    max: 100,        // Max 100 jobs
    duration: 60000  // por minuto (rate limiting)
  }
});
```

#### 3. Triggers avanzados (`server/api/routes/triggers.js`)

```javascript
// Tipos de triggers soportados:
const TRIGGER_TYPES = {
  manual: 'Ejecución manual desde UI o API',
  schedule: 'Cron expression (cada X minutos/horas/días)',
  webhook: 'HTTP POST desde sistema externo',
  email: 'Cuando llega un email a cierta dirección',
  file_watcher: 'Cuando aparece un archivo en una carpeta',
  queue_item: 'Cuando hay items en una cola de trabajo',
  workflow_completed: 'Cuando otro workflow termina',
  api: 'Llamada programática desde la API pública'
};

// Rutas:
POST /api/triggers                  → Crear trigger
GET  /api/triggers                  → Listar triggers del tenant
PUT  /api/triggers/:id              → Actualizar trigger
DELETE /api/triggers/:id            → Eliminar trigger
POST /api/triggers/webhook/:token   → Endpoint de webhook (público)
```

Tabla:
```sql
CREATE TABLE workflow_triggers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id VARCHAR(36) REFERENCES organizations(id),
    workflow_id INT REFERENCES workflows(id),
    trigger_type ENUM('manual','schedule','webhook','email','file_watcher','queue_item','workflow_completed','api'),
    config JSON NOT NULL,  -- cron expression, webhook token, file path, etc.
    enabled BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMP NULL,
    trigger_count INT DEFAULT 0,
    created_by INT REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Cola de trabajo (Queue Items) (`server/api/routes/queueItems.js`)

Estilo UiPath Orchestrator Queues para procesos transaccionales:
```javascript
// POST /api/queues                    → Crear cola
// GET  /api/queues                    → Listar colas
// POST /api/queues/:id/items          → Agregar items a la cola
// POST /api/queues/:id/items/bulk     → Agregar items masivamente
// GET  /api/queues/:id/items/next     → Obtener siguiente item (FIFO o por prioridad)
// PUT  /api/queues/:id/items/:itemId  → Marcar como completed/failed
// GET  /api/queues/:id/stats          → Estadísticas de la cola
```

```sql
CREATE TABLE work_queues (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id VARCHAR(36) REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_retries INT DEFAULT 3,
    sla_minutes INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE queue_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    queue_id VARCHAR(36) REFERENCES work_queues(id),
    tenant_id VARCHAR(36) REFERENCES organizations(id),
    data JSON NOT NULL,
    priority INT DEFAULT 5,  -- 1=highest, 10=lowest
    status ENUM('new','in_progress','completed','failed','abandoned') DEFAULT 'new',
    retry_count INT DEFAULT 0,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    result JSON,
    error_message TEXT,
    processed_by VARCHAR(255),  -- qué robot/worker lo procesó
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_queue_status (queue_id, status),
    INDEX idx_tenant_queue (tenant_id, queue_id)
);
```

#### 5. Dashboard de Orquestación (Frontend)

Modificar `src/views/ExecutorView.jsx` o crear nuevo componente:
- **Vista de cola**: jobs pending, running, completed, failed en tiempo real
- **Detalle de ejecución**: paso actual, progreso, logs en streaming
- **Retry manual**: botón para re-encolar un job fallido
- **Prioridad**: cambiar prioridad de un job en cola
- **Stats**: throughput, avg duration, error rate, cola depth

Usar WebSocket para actualizaciones en tiempo real:
```javascript
// El API emite via Socket.IO cuando un job cambia de estado
socket.emit('job:progress', { jobId, progress, currentStep });
socket.emit('job:completed', { jobId, result, duration });
socket.emit('job:failed', { jobId, error, willRetry });
```

#### 6. Ejecuciones tabla (`server/migrations/010_orchestrator.sql`)

```sql
CREATE TABLE executions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id VARCHAR(36) REFERENCES organizations(id),
    workflow_id INT REFERENCES workflows(id),
    trigger_type VARCHAR(50) DEFAULT 'manual',
    trigger_id VARCHAR(36) NULL,
    job_id VARCHAR(100),  -- BullMQ job ID
    status ENUM('queued','running','completed','failed','cancelled','retrying') DEFAULT 'queued',
    priority INT DEFAULT 5,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    duration_ms INT NULL,
    steps_total INT DEFAULT 0,
    steps_completed INT DEFAULT 0,
    steps_failed INT DEFAULT 0,
    result JSON,
    error_message TEXT,
    error_stack TEXT,
    executed_by INT REFERENCES usuarios(id),
    worker_id VARCHAR(100),
    retry_count INT DEFAULT 0,
    parent_execution_id VARCHAR(36) NULL,  -- Para subworkflows
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_status (tenant_id, status),
    INDEX idx_workflow_date (workflow_id, created_at)
);

CREATE TABLE execution_steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    execution_id VARCHAR(36) REFERENCES executions(id),
    step_index INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    label VARCHAR(255),
    status ENUM('pending','running','completed','failed','skipped') DEFAULT 'pending',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    duration_ms INT NULL,
    input_data JSON,
    output_data JSON,
    error_message TEXT,
    screenshot_path VARCHAR(500),
    INDEX idx_execution_steps (execution_id)
);
```

### RESTRICCIONES
- BullMQ, NO Bull legacy
- Redis como único message broker (no RabbitMQ)
- Los jobs deben tener `tenantId` para aislamiento
- Rate limiting por tenant según su plan
- Un job fallido va a dead letter queue después de N retries
- WebSocket para progreso en tiempo real (ya existe Socket.IO)
- NO ejecutar workflows en el proceso de la API, siempre encolar

### CRITERIOS DE ÉXITO
1. Ejecutar un workflow lo encola y el worker lo procesa
2. Ver progreso en tiempo real en el frontend
3. Retry automático cuando un workflow falla
4. Jobs con prioridad alta se procesan primero
5. Rate limiting: un tenant trial no puede ejecutar más de 100/mes
6. Webhook trigger dispara workflow correctamente
7. Queue items: agregar 100 items y procesarlos secuencialmente
8. Dashboard muestra pending/running/completed/failed en tiempo real
```
