# ALQVIMIA 2.0 - Arquitectura Modular

## Estructura de Módulos

```
modules/
├── admin-portal/          # Panel de Administración (Puerto 3001/5173)
│   ├── backend/           # API Express.js
│   └── frontend/          # React + Vite
│
├── marketplace/           # Marketplace (Puerto 3002/5174)
│   ├── backend/           # API Express.js
│   └── frontend/          # React + Vite
│
├── developer-hub/         # Hub de Desarrollo (Puerto 3003/5175)
│   ├── backend/           # API con soporte multi-ambiente
│   └── frontend/          # React + Vite con selector de ambiente
│
├── shared/                # Servicios Compartidos
│   ├── auth/              # Servicio de Autenticación (Puerto 4001)
│   └── database/          # Servicio de Base de Datos (Puerto 4002)
│
├── gateway/               # API Gateway (Puerto 4000)
│
└── docker-compose.yml     # Orquestación de contenedores
```

## Puertos

| Servicio | Puerto Backend | Puerto Frontend |
|----------|---------------|-----------------|
| API Gateway | 4000 | - |
| Auth Service | 4001 | - |
| Database Service | 4002 | - |
| Admin Portal | 3001 | 5173 |
| Marketplace | 3002 | 5174 |
| Developer Hub | 3003 | 5175 |
| PostgreSQL | 5432 | - |
| Redis | 6379 | - |

## Inicio Rápido

### Con Docker Compose

```bash
cd modules
docker-compose up -d
```

### Desarrollo Local

1. **Iniciar servicios de infraestructura:**
```bash
docker-compose up -d postgres redis
```

2. **Iniciar servicios compartidos:**
```bash
# Terminal 1 - Auth Service
cd shared/auth && npm install && npm run dev

# Terminal 2 - Database Service
cd shared/database && npm install && npm run dev
```

3. **Iniciar API Gateway:**
```bash
cd gateway && npm install && npm run dev
```

4. **Iniciar módulos (cada uno en su terminal):**
```bash
# Admin Portal Backend
cd admin-portal/backend && npm install && npm run dev

# Admin Portal Frontend
cd admin-portal/frontend && npm install && npm run dev

# Marketplace Backend
cd marketplace/backend && npm install && npm run dev

# Marketplace Frontend
cd marketplace/frontend && npm install && npm run dev

# Developer Hub Backend
cd developer-hub/backend && npm install && npm run dev

# Developer Hub Frontend
cd developer-hub/frontend && npm install && npm run dev
```

## Arquitectura

### API Gateway (Puerto 4000)

El gateway central enruta las peticiones a los módulos correspondientes:

- `/api/auth/*` → Auth Service
- `/api/admin/*` → Admin Portal Backend
- `/api/marketplace/*` → Marketplace Backend
- `/api/developer/*` → Developer Hub Backend
- `/internal/database/*` → Database Service (solo interno)

### Autenticación

Todos los módulos usan JWT centralizado:

1. El usuario se autentica en `/api/auth/login`
2. Recibe un token de acceso y un token de refresh
3. El token se incluye en el header `Authorization: Bearer <token>`
4. El gateway valida el token antes de enrutar

### Multi-tenancy

Cada tenant tiene su propio schema en PostgreSQL:

- `tenant_001` → Schema `tenant_001`
- `tenant_002` → Schema `tenant_002`
- etc.

El header `X-Tenant-Id` se usa para identificar el tenant.

### Ambientes (Developer Hub)

El Developer Hub soporta múltiples ambientes:

- **DEV**: Desarrollo con hot-reload y logs detallados
- **QA**: Testing con datos de prueba
- **PROD**: Producción con restricciones de seguridad
- **TEST**: Ambiente de pruebas automatizadas

El header `X-Environment` se usa para seleccionar el ambiente.

## Credenciales de Demo

```
Super Admin:
  Email: admin@alqvimia.com
  Password: password123

Developer:
  Email: developer@alqvimia.com
  Password: password123
```

## Variables de Entorno

Crear un archivo `.env` en la raíz de cada módulo:

```env
# Comunes
JWT_SECRET=tu-secreto-jwt-seguro
JWT_REFRESH_SECRET=tu-secreto-refresh-seguro

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_USER=alqvimia
PG_PASSWORD=alqvimia_password
PG_DATABASE=alqvimia

# Redis
REDIS_URL=redis://localhost:6379

# Servicios Internos
INTERNAL_SERVICE_KEY=alqvimia-internal-key
```

## Endpoints Principales

### Auth Service

```
POST /api/auth/login          # Iniciar sesión
POST /api/auth/logout         # Cerrar sesión
POST /api/auth/refresh        # Renovar token
POST /api/auth/register       # Registrar usuario
POST /api/auth/forgot-password # Recuperar contraseña
```

### Admin Portal

```
GET  /api/tenants             # Listar tenants
POST /api/tenants             # Crear tenant
GET  /api/users               # Listar usuarios
POST /api/billing/invoices    # Generar factura
GET  /api/audit               # Ver auditoría
```

### Marketplace

```
GET  /api/products            # Listar productos
GET  /api/products/:id        # Detalle de producto
GET  /api/categories          # Listar categorías
POST /api/purchases           # Realizar compra
GET  /api/vendors             # Listar vendors
```

### Developer Hub

```
GET  /api/projects            # Listar proyectos
POST /api/workflows           # Crear workflow
POST /api/agents              # Crear agente
POST /api/execution/run       # Ejecutar workflow/agente
POST /api/deployment          # Desplegar a ambiente
GET  /api/logs                # Ver logs
```

## Health Checks

```
GET /health           # Estado general del gateway
GET /health/live      # Liveness probe (Kubernetes)
GET /health/ready     # Readiness probe (Kubernetes)
GET /health/services  # Estado de todos los servicios
```
