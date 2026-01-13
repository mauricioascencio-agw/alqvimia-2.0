# =====================================================
# ALQVIMIA RPA 2.0 - Estado del Sistema
# =====================================================
# Ejecutar como: .\scripts\status.ps1
# =====================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ALQVIMIA RPA 2.0 - ESTADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# =====================================================
# Verificar servicios locales
# =====================================================
Write-Host "SERVICIOS LOCALES:" -ForegroundColor Yellow
Write-Host ""

# Frontend (puerto 5173)
$frontendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $frontendRunning = $true
    }
} catch {}

if ($frontendRunning) {
    Write-Host "  [OK] Frontend     http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "  [--] Frontend     No disponible" -ForegroundColor Red
}

# Backend (puerto 7000)
$backendRunning = $false
try {
    $response = Invoke-RestMethod -Uri "http://localhost:7000/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.status -eq "ok") {
        $backendRunning = $true
        $backendInfo = $response
    }
} catch {}

if ($backendRunning) {
    Write-Host "  [OK] Backend      http://localhost:7000" -ForegroundColor Green
    Write-Host "       Uptime:      $([math]::Round($backendInfo.uptime / 60, 1)) minutos" -ForegroundColor Gray
    Write-Host "       Clientes:    $($backendInfo.connectedClients)" -ForegroundColor Gray
} else {
    Write-Host "  [--] Backend      No disponible" -ForegroundColor Red
}

# MySQL (puerto 3306)
$mysqlRunning = $false
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect("localhost", 3306)
    $mysqlRunning = $tcpClient.Connected
    $tcpClient.Close()
} catch {}

if ($mysqlRunning) {
    Write-Host "  [OK] MySQL        localhost:3306" -ForegroundColor Green
} else {
    Write-Host "  [--] MySQL        No disponible" -ForegroundColor Red
}

# =====================================================
# Verificar Docker
# =====================================================
Write-Host ""
Write-Host "DOCKER:" -ForegroundColor Yellow
Write-Host ""

try {
    $dockerVersion = docker --version 2>$null
    Write-Host "  [OK] Docker instalado" -ForegroundColor Green
    Write-Host "       $dockerVersion" -ForegroundColor Gray

    # Verificar contenedores de Alqvimia
    $containers = docker ps --filter "name=alqvimia" --format "{{.Names}}: {{.Status}}" 2>$null

    if ($containers) {
        Write-Host ""
        Write-Host "  Contenedores activos:" -ForegroundColor White
        $containers | ForEach-Object {
            Write-Host "       $_" -ForegroundColor Gray
        }
    }

} catch {
    Write-Host "  [--] Docker no disponible" -ForegroundColor Red
}

# =====================================================
# Verificar archivos de configuracion
# =====================================================
Write-Host ""
Write-Host "CONFIGURACION:" -ForegroundColor Yellow
Write-Host ""

# .env del servidor
if (Test-Path "server\.env") {
    Write-Host "  [OK] server\.env" -ForegroundColor Green
} else {
    Write-Host "  [--] server\.env (no existe)" -ForegroundColor Yellow
}

# node_modules
if (Test-Path "node_modules") {
    Write-Host "  [OK] node_modules (frontend)" -ForegroundColor Green
} else {
    Write-Host "  [--] node_modules (frontend - ejecuta npm install)" -ForegroundColor Yellow
}

if (Test-Path "server\node_modules") {
    Write-Host "  [OK] node_modules (backend)" -ForegroundColor Green
} else {
    Write-Host "  [--] node_modules (backend - ejecuta npm install en server/)" -ForegroundColor Yellow
}

# =====================================================
# Base de datos
# =====================================================
Write-Host ""
Write-Host "BASE DE DATOS:" -ForegroundColor Yellow
Write-Host ""

if ($backendRunning) {
    try {
        $dbStatus = Invoke-RestMethod -Uri "http://localhost:7000/api/settings/db-status" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($dbStatus.data.connected) {
            Write-Host "  [OK] MySQL conectado" -ForegroundColor Green
        } else {
            Write-Host "  [--] MySQL no conectado" -ForegroundColor Yellow
            Write-Host "       (La app funciona sin BD)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  [--] No se pudo verificar" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [--] Backend no disponible para verificar" -ForegroundColor Yellow
}

# =====================================================
# Resumen
# =====================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($frontendRunning -and $backendRunning) {
    Write-Host "   SISTEMA OPERATIVO" -ForegroundColor Green
} elseif ($frontendRunning -or $backendRunning) {
    Write-Host "   SISTEMA PARCIAL" -ForegroundColor Yellow
} else {
    Write-Host "   SISTEMA DETENIDO" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
