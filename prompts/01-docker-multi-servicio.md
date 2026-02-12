# PROMPT 01: Arquitectura Docker Multi-Servicio

## POR QUÉ
Alqvimia RPA 2.0 actualmente corre como un monolito: un solo servidor Node.js (puerto 4000) que maneja API, ejecución de workflows, scheduling y WebSockets. Esto limita la escalabilidad a 1 servidor y no permite despliegue cloud-native. Necesitamos separar en microservicios containerizados para:
- Escalar workers de ejecución independientemente
- Alta disponibilidad (si un worker cae, los demás siguen)
- Despliegue en cualquier cloud (AWS ECS, Azure AKS, GCP GKE)
- Base para multi-tenancy y modelo SaaS con cobro

## PROMPT PARA CLAUDE

```
Eres un arquitecto de software experto en Node.js y Docker. Necesito que transformes la arquitectura de Alqvimia RPA de un monolito a microservicios Docker.

### CONTEXTO ACTUAL
- Stack: React (Vite, puerto 4200) + Node.js/Express (puerto 4000) + MySQL (Docker, puerto 3307)
- El backend está en `server/` con:
  - `server/server.js` - Servidor Express principal
  - `server/routes/` - Rutas API (workflows.js, ai.js, apiKeys.js, dashboards.js)
  - `server/services/database.js` - Servicio de base de datos MySQL
- El frontend está en `src/` (React + Vite)
- Ya existe un `docker-compose.yml` básico con mysql + phpmyadmin
- La ejecución de workflows es síncrona dentro del servidor API

### LO QUE DEBES CREAR

#### 1. Nueva estructura de Docker Compose (`docker-compose.yml`)
Servicios a crear:
```yaml
services:
  # Frontend (Vite/Nginx en producción)
  frontend:
    build: ./docker/frontend
    ports: ["4200:80"]
    depends_on: [api]

  # API Gateway (Express - solo HTTP/WebSocket, NO ejecuta workflows)
  api:
    build: ./docker/api
    ports: ["4000:4000"]
    depends_on: [mysql, redis]
    environment:
      - REDIS_URL=redis://redis:6379
      - MYSQL_HOST=mysql
      - MYSQL_PORT=3306
      - JWT_SECRET=${JWT_SECRET}

  # Worker de Ejecución (procesa workflows de la cola)
  worker:
    build: ./docker/worker
    depends_on: [mysql, redis]
    deploy:
      replicas: 2  # Escalar según necesidad
    environment:
      - REDIS_URL=redis://redis:6379
      - MYSQL_HOST=mysql

  # Scheduler (cron jobs, triggers programados)
  scheduler:
    build: ./docker/scheduler
    depends_on: [mysql, redis]

  # Redis (message broker + cache + sessions)
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: ["redis_data:/data"]

  # MySQL
  mysql:
    image: mysql:8.0
    ports: ["3307:3306"]
    volumes: ["mysql_data:/var/lib/mysql"]
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: alqvimia

  # phpMyAdmin (solo dev)
  phpmyadmin:
    image: phpmyadmin
    ports: ["8080:80"]
    depends_on: [mysql]
```

#### 2. Dockerfiles para cada servicio
Crear en `docker/`:
- `docker/api/Dockerfile` - Node.js 20 Alpine, copia solo server/, instala deps
- `docker/worker/Dockerfile` - Node.js 20 Alpine, copia server/ + engine de ejecución
- `docker/scheduler/Dockerfile` - Node.js 20 Alpine, copia scheduler
- `docker/frontend/Dockerfile` - Multi-stage: Node para build, Nginx para serve

#### 3. Separación del código backend
Refactorizar `server/server.js` para que:
- **API** (`server/api/`): Solo recibe requests HTTP/WS, valida, y encola trabajo en Redis
- **Worker** (`server/worker/`): Lee de la cola Redis y ejecuta workflows (Puppeteer, etc.)
- **Scheduler** (`server/scheduler/`): Cron jobs que encolan ejecuciones programadas
- **Shared** (`server/shared/`): Código compartido (database.js, models, utils)

#### 4. Sistema de colas con BullMQ
Crear `server/shared/queue.js`:
```javascript
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL);

// Cola principal de ejecución
export const executionQueue = new Queue('workflow-execution', { connection });

// Cola de notificaciones
export const notificationQueue = new Queue('notifications', { connection });
```

En la **API**, cuando se ejecuta un workflow:
```javascript
// ANTES (monolito): ejecutaba directamente
// AHORA (microservicio): encola y responde inmediatamente
app.post('/api/workflows/:id/execute', async (req, res) => {
  const job = await executionQueue.add('execute', {
    workflowId: req.params.id,
    userId: req.user.id,
    tenantId: req.user.tenantId,
    params: req.body
  }, {
    priority: req.body.priority || 5,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 }
  });
  res.json({ jobId: job.id, status: 'queued' });
});
```

En el **Worker**:
```javascript
import { Worker } from 'bullmq';

const worker = new Worker('workflow-execution', async (job) => {
  const { workflowId, tenantId, params } = job.data;
  // Cargar workflow de la DB
  // Ejecutar paso a paso
  // Reportar progreso: job.updateProgress(percent)
  // Guardar resultado
}, {
  connection,
  concurrency: 5, // 5 workflows simultáneos por worker
});
```

#### 5. Health checks
Cada servicio debe exponer `/health`:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api', uptime: process.uptime() });
});
```

#### 6. Script de desarrollo
Crear `dev.sh` / `dev.bat` que levante todo con hot-reload:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### RESTRICCIONES
- NO romper la funcionalidad actual. El frontend NO debe cambiar.
- La API debe mantener los mismos endpoints actuales
- Las rutas de `server/routes/` se mantienen pero se mueven a `server/api/routes/`
- La DB es la misma MySQL, no cambiar schema
- Usar BullMQ (no Bull legacy, no Bee-Queue)
- Redis 7 Alpine (ligero)
- Node.js 20 Alpine para las imágenes Docker
- El worker debe poder ejecutar Puppeteer (instalar chromium en Dockerfile)
- Variables de entorno en `.env` (no hardcodear)

### CRITERIOS DE ÉXITO
1. `docker compose up` levanta TODO (frontend, api, worker, scheduler, redis, mysql)
2. El frontend funciona igual que antes en localhost:4200
3. La API responde en localhost:4000
4. Ejecutar un workflow lo encola en Redis y el worker lo procesa
5. Si mato un worker, el otro sigue procesando
6. `docker compose up --scale worker=4` escala a 4 workers
7. Hot-reload en dev para API y frontend
```
