# =====================================================
# ALQVIMIA RPA 2.0 - Iniciar Aplicacion
# =====================================================
# Ejecutar como: .\scripts\start.ps1
# =====================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ALQVIMIA RPA 2.0 - INICIANDO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar directorio
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] Ejecuta este script desde la raiz del proyecto" -ForegroundColor Red
    exit 1
}

# Verificar dependencias
if (-not (Test-Path "node_modules")) {
    Write-Host "[!] Dependencias no instaladas. Ejecutando setup..." -ForegroundColor Yellow
    & "$PSScriptRoot\setup.ps1"
}

# =====================================================
# Iniciar Backend en segundo plano
# =====================================================
Write-Host "[*] Iniciando Backend (puerto 7000)..." -ForegroundColor Yellow

$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location "server"
    npm start
}

Write-Host "[OK] Backend iniciado (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Esperar a que el backend este listo
Write-Host "[*] Esperando a que el backend este listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# =====================================================
# Iniciar Frontend
# =====================================================
Write-Host "[*] Iniciando Frontend (puerto 5173)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   APLICACION LISTA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:7000" -ForegroundColor White
Write-Host "   API:      http://localhost:7000/api" -ForegroundColor White
Write-Host ""
Write-Host "   Presiona Ctrl+C para detener" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar frontend en primer plano
try {
    npm run dev
} finally {
    # Limpiar al salir
    Write-Host ""
    Write-Host "[*] Deteniendo servicios..." -ForegroundColor Yellow

    if ($backendJob) {
        Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job -Job $backendJob -ErrorAction SilentlyContinue
        Write-Host "[OK] Backend detenido" -ForegroundColor Green
    }

    Write-Host "[OK] Aplicacion detenida" -ForegroundColor Green
}
