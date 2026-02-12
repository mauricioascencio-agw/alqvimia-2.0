@echo off
title AlqVimia 2.0 - Sistema Completo
color 0A

:: =====================================================
:: ALQVIMIA RPA 2.0 - SCRIPT DE INICIO
:: =====================================================
:: Configuracion en .env (raiz del proyecto)
:: =====================================================

:: Cambiar al directorio donde esta el script
cd /d "%~dp0"

:: Cargar variables de .env
set VITE_PORT=4200
set BACKEND_PORT=4000
set MYSQL_PORT=3307
set PHPMYADMIN_PORT=8081

if exist ".env" (
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%b"=="" (
            set "%%a=%%b"
        )
    )
)

:: Verificar argumentos
if "%1"=="docker" goto :docker
if "%1"=="setup" goto :setup
if "%1"=="status" goto :status
if "%1"=="help" goto :help

:local
echo.
echo  ========================================
echo       ALQVIMIA 2.0 - RPA AUTOMATION
echo  ========================================
echo.
echo  Puertos configurados:
echo    Frontend: %VITE_PORT%
echo    Backend:  %BACKEND_PORT%
echo.
echo  Iniciando servicios locales...
echo.

:: Verificar si node_modules del frontend existe
if not exist "node_modules" (
    echo  [1/4] Instalando dependencias del frontend...
    call npm install
    echo       Dependencias del frontend instaladas.
) else (
    echo  [1/4] Dependencias del frontend OK
)

:: Verificar si node_modules del servidor existe
if not exist "server\node_modules" (
    echo  [2/4] Instalando dependencias del servidor...
    pushd server
    call npm install
    popd
    echo       Dependencias del servidor instaladas.
) else (
    echo  [2/4] Dependencias del servidor OK
)

:: Matar proceso que ocupe el puerto del backend
echo  [3/6] Liberando puerto %BACKEND_PORT%...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%BACKEND_PORT%" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p > nul 2>&1
)

:: Levantar MySQL con Docker si no esta corriendo
echo  [4/6] Verificando MySQL (Docker)...
docker ps --filter "name=alqvimia-mysql" --format "{{.Status}}" 2>nul | findstr /i "healthy" > nul 2>&1
if errorlevel 1 (
    echo       Iniciando MySQL y phpMyAdmin con Docker...
    docker-compose up -d mysql phpmyadmin
    echo       Esperando a que MySQL este listo...
    :wait_mysql
    timeout /t 3 /nobreak > nul
    docker ps --filter "name=alqvimia-mysql" --format "{{.Status}}" 2>nul | findstr /i "healthy" > nul 2>&1
    if errorlevel 1 goto :wait_mysql
    echo       MySQL listo.
) else (
    echo       MySQL ya esta corriendo.
)

echo.
echo  [5/6] Iniciando Backend (Puerto %BACKEND_PORT%)...
start "Alqvimia Backend" cmd /k "cd /d "%~dp0server" && npm start"

:: Esperar a que el servidor inicie
timeout /t 3 /nobreak > nul

echo  [6/6] Iniciando Frontend (Puerto %VITE_PORT%)...
start "Alqvimia Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

:: Esperar a que Vite inicie y abrir navegador
echo.
echo  Abriendo navegador...
timeout /t 4 /nobreak > nul
start "" http://localhost:%VITE_PORT%

echo.
echo  ========================================
echo       SERVICIOS INICIADOS
echo  ========================================
echo.
echo   Frontend:    http://localhost:%VITE_PORT%
echo   Backend:     http://localhost:%BACKEND_PORT%
echo   API Health:  http://localhost:%BACKEND_PORT%/api/health
echo.
echo   Presiona cualquier tecla para cerrar
echo   ambos servicios...
echo  ========================================
echo.

pause > nul

:: Cerrar ventanas de los servicios
taskkill /FI "WINDOWTITLE eq Alqvimia Backend*" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Alqvimia Frontend*" /F > nul 2>&1
:: Liberar puerto del backend por si quedo un proceso huerfano
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%BACKEND_PORT%" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p > nul 2>&1
)

echo.
echo  Servicios detenidos.
goto :eof

:docker
echo.
echo  ========================================
echo       ALQVIMIA 2.0 - DOCKER MODE
echo  ========================================
echo.
echo  Puertos configurados (.env):
echo    Frontend:   %VITE_PORT%
echo    Backend:    %BACKEND_PORT%
echo    MySQL:      %MYSQL_PORT%
echo    phpMyAdmin: %PHPMYADMIN_PORT%
echo.
echo  Iniciando con Docker Compose...
echo.

docker-compose up

goto :eof

:setup
echo.
echo  ========================================
echo       ALQVIMIA 2.0 - SETUP
echo  ========================================
echo.

powershell -ExecutionPolicy Bypass -File ".\scripts\setup.ps1"

goto :eof

:status
echo.
echo  ========================================
echo       ALQVIMIA 2.0 - STATUS
echo  ========================================
echo.

powershell -ExecutionPolicy Bypass -File ".\scripts\status.ps1"

goto :eof

:help
echo.
echo  ========================================
echo       ALQVIMIA 2.0 - AYUDA
echo  ========================================
echo.
echo  Uso: run.bat [comando]
echo.
echo  Comandos:
echo    (sin args)   Iniciar servicios locales
echo    docker       Iniciar con Docker Compose
echo    setup        Instalar dependencias
echo    status       Ver estado del sistema
echo    help         Mostrar esta ayuda
echo.
echo  Configuracion (.env en raiz):
echo    VITE_PORT=4200       Frontend
echo    BACKEND_PORT=4000    Backend API
echo    MYSQL_PORT=3307      MySQL
echo    PHPMYADMIN_PORT=8081 phpMyAdmin
echo.
echo  PowerShell Scripts:
echo    .\scripts\setup.ps1        Instalacion
echo    .\scripts\start.ps1        Iniciar
echo    .\scripts\docker-start.ps1 Docker
echo    .\scripts\docker-stop.ps1  Detener
echo    .\scripts\db-init.ps1      MySQL init
echo    .\scripts\status.ps1       Estado
echo    .\scripts\clean.ps1        Limpiar
echo.
goto :eof
