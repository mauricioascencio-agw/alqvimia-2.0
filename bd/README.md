# Base de Datos Alqvimia RPA 2.0

## Requisitos

- MySQL 8.0 o superior
- Acceso de administrador a MySQL

## Instalacion

### 1. Crear la base de datos

Ejecuta el script SQL para crear la base de datos y todas las tablas:

```bash
# Desde la raiz del proyecto
mysql -u root -p < bd/schema.sql
```

O desde MySQL Workbench, abre el archivo `schema.sql` y ejecutalo.

### 2. Configurar conexion

Crea un archivo `.env` en la carpeta `server/` basado en `.env.example`:

```bash
cd server
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=alqvimia_rpa
```

### 3. Instalar dependencias

```bash
cd server
npm install
```

## Estructura de la Base de Datos

### Tablas Principales

| Tabla | Descripcion |
|-------|-------------|
| `usuarios` | Usuarios del sistema |
| `configuraciones_sistema` | Configuraciones globales |
| `configuraciones_usuario` | Preferencias por usuario |
| `temas` | Temas visuales disponibles |
| `workflows` | Flujos de trabajo/automatizaciones |
| `ejecuciones` | Historial de ejecuciones |
| `plantillas_ia` | Plantillas de modelos IA |
| `plantillas_agentes` | Plantillas de agentes RPA |
| `conexiones_mcp` | Conexiones a servidores MCP |
| `variables_globales` | Variables del sistema |
| `acciones_grabadas` | Acciones del recorder |
| `sesiones_grabacion` | Sesiones de grabacion |
| `logs_sistema` | Logs del sistema |
| `notificaciones` | Notificaciones a usuarios |
| `sesiones_videoconferencia` | Sesiones de video |

### Datos Iniciales

El script incluye datos iniciales:

- **10 temas** visuales predefinidos
- **12 plantillas IA** (GPT, Claude, etc.)
- **12 plantillas de agentes** RPA
- **Configuraciones** del sistema por defecto
- **Usuario admin** por defecto

## API Endpoints

### Configuraciones

```
GET  /api/settings/system         - Obtener configuraciones del sistema
PUT  /api/settings/system         - Actualizar configuraciones
GET  /api/settings/user/:id       - Obtener config de usuario
PUT  /api/settings/user/:id       - Guardar config de usuario
GET  /api/settings/themes         - Obtener temas
PUT  /api/settings/theme          - Cambiar tema de usuario
GET  /api/settings/ai-templates   - Obtener plantillas IA
GET  /api/settings/agent-templates - Obtener plantillas agentes
GET  /api/settings/db-status      - Estado de conexion a BD
```

## Conexion Actual (Desarrollo)

La base de datos MySQL corre en Docker con la siguiente configuracion:

| Parametro | Valor |
|-----------|-------|
| **Host** | `localhost` |
| **Puerto** | `3307` |
| **Base de datos** | `alqvimia_rpa` |
| **Usuario** | `root` |
| **Password** | `root` |

### Cadena de conexion

```
mysql://root:root@localhost:3307/alqvimia_rpa
```

### Variables de entorno (.env)

```env
MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=alqvimia_rpa
```

### Docker Compose

El contenedor MySQL se define en `docker-compose.yml`:

```yaml
mysql:
  image: mysql:8.0
  ports:
    - "3307:3306"
  environment:
    MYSQL_ROOT_PASSWORD: root
    MYSQL_DATABASE: alqvimia_rpa
```

### Comandos utiles

```bash
# Iniciar MySQL con Docker
docker compose up -d mysql

# Ver logs del contenedor
docker compose logs -f mysql

# Conectar via CLI
docker exec -it alqvimia-mysql mysql -uroot -proot alqvimia_rpa

# Ejecutar schema
docker exec -i alqvimia-mysql mysql -uroot -proot < bd/schema.sql
```

## Notas

- La aplicacion funciona sin base de datos (modo offline)
- Las configuraciones se guardan en localStorage como fallback
- MySQL es opcional pero recomendado para produccion
- En desarrollo se usa el puerto **3307** para evitar conflictos con MySQL local
