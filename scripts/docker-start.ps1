# =====================================================
# ALQVIMIA RPA 2.0 - Iniciar con Docker
# =====================================================
# Ejecutar como: .\scripts\docker-start.ps1
# =====================================================

param(
    [switch]$Build,
    [switch]$Detach,
    [switch]$Logs
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ALQVIMIA RPA 2.0 - DOCKER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar directorio
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "[ERROR] No se encontro docker-compose.yml" -ForegroundColor Red
    Write-Host "        Ejecuta desde la raiz del proyecto" -ForegroundColor Red
    exit 1
}

# Verificar Docker
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
} catch {
    Write-Host "[ERROR] Docker no esta instalado o no esta ejecutandose" -ForegroundColor Red
    Write-Host "        Instala Docker Desktop: https://docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Crear archivo .env si no existe
$envPath = ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "[*] Creando archivo .env..." -ForegroundColor Yellow
    @"
# Alqvimia RPA 2.0 - Docker Environment
MYSQL_ROOT_PASSWORD=alqvimia2024
MYSQL_PASSWORD=alqvimia2024
"@ | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host "[OK] Archivo .env creado" -ForegroundColor Green
}

# Construir si se solicita
if ($Build) {
    Write-Host "[*] Construyendo imagenes Docker..." -ForegroundColor Yellow
    docker-compose build
    Write-Host "[OK] Imagenes construidas" -ForegroundColor Green
}

# Iniciar servicios
Write-Host "[*] Iniciando servicios Docker..." -ForegroundColor Yellow
Write-Host ""

if ($Detach) {
    docker-compose up -d
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   SERVICIOS INICIADOS (BACKGROUND)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Frontend:   http://localhost:5173" -ForegroundColor White
    Write-Host "   Backend:    http://localhost:7000" -ForegroundColor White
    Write-Host "   phpMyAdmin: http://localhost:8080" -ForegroundColor White
    Write-Host "   MySQL:      localhost:3306" -ForegroundColor White
    Write-Host ""
    Write-Host "Comandos utiles:" -ForegroundColor Yellow
    Write-Host "   docker-compose logs -f          # Ver logs" -ForegroundColor Gray
    Write-Host "   docker-compose ps               # Ver estado" -ForegroundColor Gray
    Write-Host "   .\scripts\docker-stop.ps1       # Detener" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   SERVICIOS EN EJECUCION" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Frontend:   http://localhost:5173" -ForegroundColor White
    Write-Host "   Backend:    http://localhost:7000" -ForegroundColor White
    Write-Host "   phpMyAdmin: http://localhost:8080" -ForegroundColor White
    Write-Host "   MySQL:      localhost:3306" -ForegroundColor White
    Write-Host ""
    Write-Host "   Presiona Ctrl+C para detener" -ForegroundColor Gray
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    docker-compose up
}
