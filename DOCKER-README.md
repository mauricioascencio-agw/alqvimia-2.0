# Alqvimia 2.0 RPA - Guía Docker

## Configuración Completada

Se ha configurado Docker Compose para ejecutar toda la aplicación en contenedores.

## Requisitos Previos

- Docker Desktop instalado
- Docker Compose instalado
- Archivo `.env` en la raíz del proyecto (ya creado)

## Arquitectura

La aplicación se compone de 4 servicios:

1. **MySQL** (puerto 3307) - Base de datos
2. **phpMyAdmin** (puerto 8081) - Administrador de BD
3. **Backend** (puerto 4000) - API Node.js + Socket.IO
4. **Frontend** (puerto 4200) - Aplicación Vite + React

## Inicio Rápido

### Opción 1: Usar run.bat (Recomendado)
```bash
run.bat docker
```

### Opción 2: Docker Compose directamente
```bash
docker-compose up
```

### Opción 3: En segundo plano
```bash
docker-compose up -d
```

## Comandos Útiles

### Ver logs de todos los servicios
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Detener los servicios
```bash
docker-compose down
```

### Detener y eliminar volúmenes (BORRA LA BASE DE DATOS)
```bash
docker-compose down -v
```

### Reconstruir las imágenes
```bash
docker-compose build
```

### Reconstruir y ejecutar
```bash
docker-compose up --build
```

### Ver estado de los servicios
```bash
docker-compose ps
```

### Ejecutar comandos dentro de un contenedor
```bash
# Entrar al contenedor del backend
docker-compose exec backend sh

# Ejecutar comando en MySQL
docker-compose exec mysql mysql -uroot -palqvimia2024 alqvimia_rpa
```

## URLs de Acceso

Una vez iniciados los servicios:

- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:4000/api
- **Backend Health:** http://localhost:4000/api/health
- **phpMyAdmin:** http://localhost:8082

### Credenciales phpMyAdmin
- **Servidor:** mysql
- **Usuario:** root
- **Contraseña:** alqvimia2024

## Arquitectura de Red Docker

Los servicios se comunican entre sí usando una red Docker bridge llamada `alqvimia-network`:

- **Frontend → Backend**: Usa el proxy de Vite configurado para apuntar al servicio `backend` en el puerto 4000
- **Backend → MySQL**: Se conecta al servicio `mysql` en el puerto 3306 (interno)
- **Host → Servicios**: Accede a los puertos mapeados (4200, 4000, 3307, 8082)

El archivo [vite.config.js](vite.config.js) está configurado para usar:
- `VITE_BACKEND_HOST=backend` en Docker (comunicación interna entre contenedores)
- `VITE_BACKEND_HOST=localhost` en ejecución local

## Configuración de Puertos

Los puertos están definidos en el archivo `.env`:

```env
VITE_PORT=4200
BACKEND_PORT=4000
MYSQL_PORT=3307
PHPMYADMIN_PORT=8081
```

Puedes cambiarlos si tienes conflictos de puertos.

## Volúmenes Persistentes

Los datos se guardan en volúmenes Docker:

- `mysql_data` - Datos de la base de datos
- `backend_logs` - Logs del backend
- `backend_data` - Datos del backend

Para ver los volúmenes:
```bash
docker volume ls
```

## Solución de Problemas

### El backend no se conecta a MySQL

Espera 30-60 segundos. El backend tiene un script de espera que intenta conectarse a MySQL hasta que esté listo.

### Puerto ocupado

Si algún puerto está ocupado, modifica el archivo `.env` y reinicia:
```bash
docker-compose down
docker-compose up
```

### Reconstruir desde cero

Si hay problemas, elimina todo y vuelve a construir:
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Ver logs de errores

```bash
# Ver logs completos
docker-compose logs

# Ver solo errores del backend
docker-compose logs backend | grep -i error

# Seguir logs en tiempo real
docker-compose logs -f --tail=100
```

### MySQL no inicia correctamente

Verifica que el archivo `bd/schema.sql` existe y es válido:
```bash
ls -la bd/schema.sql
```

### Problemas con Playwright

El Dockerfile del backend ya incluye Chromium. Si hay errores, verifica los logs:
```bash
docker-compose logs backend | grep -i playwright
```

## Desarrollo

### Hot Reload

El frontend y backend tienen hot reload activado mediante volúmenes:
- Los cambios en archivos `.js`, `.jsx` se reflejan automáticamente
- No necesitas reconstruir las imágenes para cambios de código

### Instalar nuevas dependencias

Si agregas dependencias al `package.json`:
```bash
docker-compose down
docker-compose build
docker-compose up
```

## Producción

Para producción, modifica `docker-compose.yml`:

1. Cambia `NODE_ENV` a `production`
2. Elimina los volúmenes de montaje de código
3. Usa secretos seguros en `.env`
4. Considera usar un proxy reverso (nginx)

## Diferencias con Ejecución Local

### Local (run.bat sin argumentos)
- MySQL debe estar instalado localmente
- Node.js debe estar instalado
- Dependencias instaladas en el sistema

### Docker (run.bat docker)
- Todo en contenedores aislados
- No requiere instalaciones locales
- Base de datos persistente en volúmenes
- Fácil de resetear y reproducir

## Siguiente Paso

¿Quieres ejecutar la aplicación en Docker ahora?

```bash
run.bat docker
```

O si prefieres ver los logs en detalle:
```bash
docker-compose up
```
