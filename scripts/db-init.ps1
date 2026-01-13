# =====================================================
# ALQVIMIA RPA 2.0 - Inicializar Base de Datos
# =====================================================
# Ejecutar como: .\scripts\db-init.ps1
# =====================================================

param(
    [string]$Host = "localhost",
    [int]$Port = 3306,
    [string]$User = "root",
    [string]$Password = "",
    [switch]$Docker
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ALQVIMIA RPA 2.0 - INIT DATABASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar archivo SQL
$schemaPath = "bd\schema.sql"
if (-not (Test-Path $schemaPath)) {
    Write-Host "[ERROR] No se encontro $schemaPath" -ForegroundColor Red
    exit 1
}

if ($Docker) {
    # Inicializar via Docker
    Write-Host "[*] Inicializando base de datos via Docker..." -ForegroundColor Yellow

    # Verificar que el contenedor este corriendo
    $containerRunning = docker ps --filter "name=alqvimia-mysql" --format "{{.Names}}" 2>$null

    if (-not $containerRunning) {
        Write-Host "[!] El contenedor MySQL no esta corriendo" -ForegroundColor Yellow
        Write-Host "    Iniciando con docker-compose..." -ForegroundColor Yellow
        docker-compose up -d mysql

        Write-Host "[*] Esperando a que MySQL este listo..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
    }

    # Ejecutar script SQL
    Write-Host "[*] Ejecutando schema.sql..." -ForegroundColor Yellow

    Get-Content $schemaPath | docker exec -i alqvimia-mysql mysql -uroot -palqvimia2024

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Base de datos inicializada correctamente" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Error al inicializar la base de datos" -ForegroundColor Red
        exit 1
    }

} else {
    # Inicializar via MySQL local
    Write-Host "[*] Inicializando base de datos local..." -ForegroundColor Yellow
    Write-Host "    Host: $Host" -ForegroundColor Gray
    Write-Host "    Port: $Port" -ForegroundColor Gray
    Write-Host "    User: $User" -ForegroundColor Gray
    Write-Host ""

    # Solicitar password si no se proporciono
    if ([string]::IsNullOrEmpty($Password)) {
        $securePassword = Read-Host "Password de MySQL" -AsSecureString
        $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
    }

    # Verificar que mysql este disponible
    try {
        mysql --version | Out-Null
    } catch {
        Write-Host "[ERROR] MySQL CLI no esta instalado" -ForegroundColor Red
        Write-Host "        Instala MySQL o usa la opcion -Docker" -ForegroundColor Red
        exit 1
    }

    # Ejecutar script SQL
    Write-Host "[*] Ejecutando schema.sql..." -ForegroundColor Yellow

    if ([string]::IsNullOrEmpty($Password)) {
        $command = "mysql -h $Host -P $Port -u $User < `"$schemaPath`""
    } else {
        $command = "mysql -h $Host -P $Port -u $User -p`"$Password`" < `"$schemaPath`""
    }

    Invoke-Expression $command

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Base de datos inicializada correctamente" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Error al inicializar la base de datos" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BASE DE DATOS LISTA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Base de datos: alqvimia_rpa" -ForegroundColor White
Write-Host ""
Write-Host "Tablas creadas:" -ForegroundColor White
Write-Host "  - usuarios" -ForegroundColor Gray
Write-Host "  - configuraciones_sistema" -ForegroundColor Gray
Write-Host "  - configuraciones_usuario" -ForegroundColor Gray
Write-Host "  - temas" -ForegroundColor Gray
Write-Host "  - workflows" -ForegroundColor Gray
Write-Host "  - ejecuciones" -ForegroundColor Gray
Write-Host "  - plantillas_ia" -ForegroundColor Gray
Write-Host "  - plantillas_agentes" -ForegroundColor Gray
Write-Host "  - y mas..." -ForegroundColor Gray
Write-Host ""
Write-Host "Usuario admin creado:" -ForegroundColor White
Write-Host "  Email: admin@alqvimia.local" -ForegroundColor Gray
Write-Host ""
