# =====================================================
# ALQVIMIA RPA 2.0 - Detener Docker
# =====================================================
# Ejecutar como: .\scripts\docker-stop.ps1
# =====================================================

param(
    [switch]$Clean,
    [switch]$RemoveVolumes
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ALQVIMIA RPA 2.0 - DETENIENDO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar directorio
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "[ERROR] No se encontro docker-compose.yml" -ForegroundColor Red
    exit 1
}

# Detener servicios
Write-Host "[*] Deteniendo servicios..." -ForegroundColor Yellow

if ($RemoveVolumes) {
    Write-Host "[!] ADVERTENCIA: Se eliminaran los datos de MySQL" -ForegroundColor Red
    $confirm = Read-Host "Continuar? (s/N)"
    if ($confirm -ne "s" -and $confirm -ne "S") {
        Write-Host "[*] Operacion cancelada" -ForegroundColor Yellow
        exit 0
    }
    docker-compose down -v
    Write-Host "[OK] Servicios detenidos y volumenes eliminados" -ForegroundColor Green
} elseif ($Clean) {
    docker-compose down --rmi local
    Write-Host "[OK] Servicios detenidos e imagenes locales eliminadas" -ForegroundColor Green
} else {
    docker-compose down
    Write-Host "[OK] Servicios detenidos" -ForegroundColor Green
}

Write-Host ""
Write-Host "Los datos de MySQL se mantienen en el volumen 'mysql_data'" -ForegroundColor Gray
Write-Host "Usa -RemoveVolumes para eliminarlos" -ForegroundColor Gray
Write-Host ""
