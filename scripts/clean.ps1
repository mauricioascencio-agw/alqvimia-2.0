# =====================================================
# ALQVIMIA RPA 2.0 - Limpiar Proyecto
# =====================================================
# Ejecutar como: .\scripts\clean.ps1
# =====================================================

param(
    [switch]$All,
    [switch]$Docker,
    [switch]$NodeModules,
    [switch]$Force
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ALQVIMIA RPA 2.0 - LIMPIEZA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $All -and -not $Docker -and -not $NodeModules) {
    Write-Host "Uso: .\scripts\clean.ps1 [opciones]" -ForegroundColor White
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  -All           Limpiar todo" -ForegroundColor Gray
    Write-Host "  -Docker        Limpiar recursos Docker" -ForegroundColor Gray
    Write-Host "  -NodeModules   Eliminar node_modules" -ForegroundColor Gray
    Write-Host "  -Force         No pedir confirmacion" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

# Confirmar
if (-not $Force) {
    Write-Host "[!] Esta operacion eliminara archivos" -ForegroundColor Yellow

    if ($All) {
        Write-Host "    - node_modules (frontend y backend)" -ForegroundColor Gray
        Write-Host "    - Contenedores e imagenes Docker" -ForegroundColor Gray
        Write-Host "    - Volumenes Docker (datos de MySQL)" -ForegroundColor Gray
    } elseif ($Docker) {
        Write-Host "    - Contenedores e imagenes Docker" -ForegroundColor Gray
        Write-Host "    - Volumenes Docker (datos de MySQL)" -ForegroundColor Gray
    } elseif ($NodeModules) {
        Write-Host "    - node_modules (frontend y backend)" -ForegroundColor Gray
    }

    Write-Host ""
    $confirm = Read-Host "Continuar? (s/N)"
    if ($confirm -ne "s" -and $confirm -ne "S") {
        Write-Host "[*] Operacion cancelada" -ForegroundColor Yellow
        exit 0
    }
}

# Limpiar Docker
if ($All -or $Docker) {
    Write-Host ""
    Write-Host "[*] Limpiando Docker..." -ForegroundColor Yellow

    # Detener contenedores
    Write-Host "    Deteniendo contenedores..." -ForegroundColor Gray
    docker-compose down -v 2>$null

    # Eliminar imagenes
    Write-Host "    Eliminando imagenes..." -ForegroundColor Gray
    docker rmi alqvimia-2.0-backend alqvimia-2.0-frontend 2>$null

    # Limpiar recursos no usados
    Write-Host "    Limpiando recursos..." -ForegroundColor Gray
    docker system prune -f 2>$null

    Write-Host "[OK] Docker limpiado" -ForegroundColor Green
}

# Limpiar node_modules
if ($All -or $NodeModules) {
    Write-Host ""
    Write-Host "[*] Eliminando node_modules..." -ForegroundColor Yellow

    if (Test-Path "node_modules") {
        Write-Host "    Eliminando node_modules (frontend)..." -ForegroundColor Gray
        Remove-Item -Recurse -Force "node_modules"
    }

    if (Test-Path "server\node_modules") {
        Write-Host "    Eliminando node_modules (backend)..." -ForegroundColor Gray
        Remove-Item -Recurse -Force "server\node_modules"
    }

    # Eliminar package-lock.json
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
    }
    if (Test-Path "server\package-lock.json") {
        Remove-Item -Force "server\package-lock.json"
    }

    Write-Host "[OK] node_modules eliminados" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   LIMPIEZA COMPLETADA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($All -or $NodeModules) {
    Write-Host "Para reinstalar dependencias:" -ForegroundColor White
    Write-Host "  .\scripts\setup.ps1" -ForegroundColor Gray
    Write-Host ""
}
