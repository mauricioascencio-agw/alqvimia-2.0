# =====================================================
# ALQVIMIA RPA 2.0 - Script de Instalacion
# =====================================================
# Ejecutar como: .\scripts\setup.ps1
# =====================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ALQVIMIA RPA 2.0 - INSTALACION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] Ejecuta este script desde la raiz del proyecto" -ForegroundColor Red
    exit 1
}

# Funcion para mostrar progreso
function Show-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "[*] $Message" -ForegroundColor Yellow
}

# Funcion para mostrar exito
function Show-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

# Funcion para mostrar error
function Show-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# =====================================================
# 1. Verificar Node.js
# =====================================================
Show-Step "Verificando Node.js..."

try {
    $nodeVersion = node --version
    Write-Host "    Node.js instalado: $nodeVersion"
    Show-Success "Node.js disponible"
} catch {
    Show-Error "Node.js no esta instalado"
    Write-Host "    Descarga Node.js de: https://nodejs.org/"
    exit 1
}

# =====================================================
# 2. Instalar dependencias del Frontend
# =====================================================
Show-Step "Instalando dependencias del Frontend..."

try {
    npm install
    Show-Success "Dependencias del frontend instaladas"
} catch {
    Show-Error "Error instalando dependencias del frontend"
    exit 1
}

# =====================================================
# 3. Instalar dependencias del Backend
# =====================================================
Show-Step "Instalando dependencias del Backend..."

try {
    Push-Location "server"
    npm install
    Pop-Location
    Show-Success "Dependencias del backend instaladas"
} catch {
    Pop-Location
    Show-Error "Error instalando dependencias del backend"
    exit 1
}

# =====================================================
# 4. Crear archivo .env si no existe
# =====================================================
Show-Step "Configurando variables de entorno..."

$envPath = "server\.env"
$envExamplePath = "server\.env.example"

if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
        Write-Host "    Archivo .env creado desde .env.example"
        Write-Host "    [!] Edita server\.env con tus credenciales de MySQL" -ForegroundColor Yellow
    } else {
        # Crear .env basico
        @"
PORT=7000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=alqvimia_rpa
"@ | Out-File -FilePath $envPath -Encoding UTF8
        Write-Host "    Archivo .env creado con valores por defecto"
    }
    Show-Success "Variables de entorno configuradas"
} else {
    Write-Host "    Archivo .env ya existe"
    Show-Success "Variables de entorno OK"
}

# =====================================================
# 5. Verificar Docker (opcional)
# =====================================================
Show-Step "Verificando Docker (opcional)..."

try {
    $dockerVersion = docker --version
    Write-Host "    Docker instalado: $dockerVersion"
    Show-Success "Docker disponible"
    $dockerAvailable = $true
} catch {
    Write-Host "    Docker no instalado (opcional para desarrollo)"
    $dockerAvailable = $false
}

# =====================================================
# 6. Verificar MySQL (opcional)
# =====================================================
Show-Step "Verificando MySQL (opcional)..."

try {
    $mysqlVersion = mysql --version
    Write-Host "    MySQL instalado: $mysqlVersion"
    Show-Success "MySQL disponible"
    $mysqlAvailable = $true
} catch {
    Write-Host "    MySQL no instalado localmente"
    Write-Host "    Puedes usar Docker o instalar MySQL manualmente"
    $mysqlAvailable = $false
}

# =====================================================
# RESUMEN
# =====================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INSTALACION COMPLETADA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Componentes instalados:" -ForegroundColor White
Write-Host "  [OK] Frontend (React + Vite)" -ForegroundColor Green
Write-Host "  [OK] Backend (Node.js + Express)" -ForegroundColor Green

if ($dockerAvailable) {
    Write-Host "  [OK] Docker disponible" -ForegroundColor Green
} else {
    Write-Host "  [--] Docker no disponible" -ForegroundColor Yellow
}

if ($mysqlAvailable) {
    Write-Host "  [OK] MySQL disponible" -ForegroundColor Green
} else {
    Write-Host "  [--] MySQL no disponible" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor White
Write-Host "  1. Configura MySQL (local o Docker)" -ForegroundColor Gray
Write-Host "  2. Ejecuta: .\scripts\start.ps1" -ForegroundColor Gray
Write-Host "  3. Abre: http://localhost:5173" -ForegroundColor Gray
Write-Host ""

if ($dockerAvailable) {
    Write-Host "O usa Docker:" -ForegroundColor White
    Write-Host "  .\scripts\docker-start.ps1" -ForegroundColor Gray
    Write-Host ""
}
