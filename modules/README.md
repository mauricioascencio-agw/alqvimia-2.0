# ALQVIMIA 2.0 - Arquitectura Modular

## Estructura de Módulos

```
modules/
├── admin-portal/      # :3001 - Panel de Administración Alqvimia
├── marketplace/       # :3002 - Marketplace de Agentes y Plantillas
├── developer-hub/     # :3003 - Hub de Desarrollo con ambientes
│
shared/                # Código compartido entre módulos
├── auth/             # Autenticación centralizada (JWT/OAuth)
├── database/         # Modelos y conexiones compartidas
└── utils/            # Utilidades comunes
│
gateway/              # :4000 - API Gateway / Orchestrator
```

## Puertos y URLs

| Módulo | Puerto | URL Producción | Descripción |
|--------|--------|----------------|-------------|
| Gateway | 4000 | api.alqvimia.com | API Gateway central |
| Admin Portal | 3001 | admin.alqvimia.com | Super Admin |
| Marketplace | 3002 | marketplace.alqvimia.com | Tienda de agentes |
| Developer Hub | 3003 | dev.alqvimia.com | IDE y herramientas |

## Ambientes (Developer Hub)

| Ambiente | Descripción | Base de datos |
|----------|-------------|---------------|
| DEV | Desarrollo local | alqvimia_dev |
| QA | Testing/Staging | alqvimia_qa |
| PROD | Producción | alqvimia_prod |

## Comandos

```bash
# Iniciar todos los módulos
npm run start:all

# Iniciar módulo específico
npm run start:admin
npm run start:marketplace
npm run start:developer

# Build de producción
npm run build:all
```
