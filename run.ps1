# Main In Motion - Windows Setup Script
# Run in PowerShell: Right-click PowerShell -> Run as Administrator
# Or: powershell -ExecutionPolicy Bypass -File run.ps1

param(
    [string]$Port = '8080',
    [string]$InstallDir = (Join-Path $env:USERPROFILE 'main-in-motion')
)

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  Main In Motion - Setup' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

# --- Check admin ---
$currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host 'This script needs Administrator privileges to check/install Docker.' -ForegroundColor Yellow
    Write-Host ''
    $response = Read-Host 'Restart as Administrator? (Y/n)'
    if ($response -eq '' -or $response -match '^[Yy]') {
        $argString = '-ExecutionPolicy Bypass -File "' + $PSCommandPath + '" -Port ' + $Port + ' -InstallDir "' + $InstallDir + '"'
        Start-Process powershell -ArgumentList $argString -Verb RunAs
        exit
    }
    else {
        Write-Host 'Continuing without admin. Docker must already be installed and running.' -ForegroundColor Yellow
    }
}

# --- Check Docker ---
Write-Host '[1/5] Checking Docker...' -ForegroundColor Yellow
$dockerExists = $null
try { $dockerExists = Get-Command docker -ErrorAction SilentlyContinue } catch {}

if (-not $dockerExists) {
    Write-Host '  Docker not found.' -ForegroundColor Red
    Write-Host ''
    Write-Host '  Docker Desktop is required. Install it from:' -ForegroundColor White
    Write-Host '  https://www.docker.com/products/docker-desktop/' -ForegroundColor Cyan
    Write-Host ''
    $response = Read-Host '  Open the download page now? (Y/n)'
    if ($response -eq '' -or $response -match '^[Yy]') {
        Start-Process 'https://www.docker.com/products/docker-desktop/'
    }
    Write-Host ''
    Write-Host '  After installing Docker Desktop, restart this script.' -ForegroundColor Yellow
    Read-Host 'Press Enter to exit'
    exit 1
}

# Check Docker is running - try docker ps as a lightweight check
$dockerRunning = $false
try {
    $null = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) { $dockerRunning = $true }
}
catch {}

if (-not $dockerRunning) {
    # Fallback: try docker version which works even with partial startup
    try {
        $null = docker version 2>&1
        if ($LASTEXITCODE -eq 0) { $dockerRunning = $true }
    }
    catch {}
}

if ($dockerRunning) {
    Write-Host '  Docker is installed and running.' -ForegroundColor Green
}
else {
    Write-Host '  Docker is installed but may not be fully started.' -ForegroundColor Yellow
    $response = Read-Host '  Continue anyway? (Y/n)'
    if ($response -ne '' -and $response -notmatch '^[Yy]') {
        Read-Host 'Press Enter to exit'
        exit 1
    }
}

# --- Check Git ---
Write-Host '[2/5] Checking Git...' -ForegroundColor Yellow
$gitExists = $null
try { $gitExists = Get-Command git -ErrorAction SilentlyContinue } catch {}

if (-not $gitExists) {
    Write-Host '  Git not found. Installing via winget...' -ForegroundColor Yellow
    try {
        winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
        $machinePath = [System.Environment]::GetEnvironmentVariable('Path', [System.EnvironmentVariableTarget]::Machine)
        $userPath = [System.Environment]::GetEnvironmentVariable('Path', [System.EnvironmentVariableTarget]::User)
        $env:Path = $machinePath + ';' + $userPath
    }
    catch {
        Write-Host '  Could not auto-install Git. Please install from https://git-scm.com/download/win' -ForegroundColor Red
        Read-Host 'Press Enter to exit'
        exit 1
    }
}
Write-Host '  Git is available.' -ForegroundColor Green

# --- Clone repo ---
Write-Host '[3/5] Cloning repository...' -ForegroundColor Yellow

if (Test-Path $InstallDir) {
    Write-Host ('  Directory already exists at ' + $InstallDir) -ForegroundColor Yellow
    $response = Read-Host '  Pull latest changes? (Y/n)'
    if ($response -eq '' -or $response -match '^[Yy]') {
        Push-Location $InstallDir
        git pull origin main 2>&1
        Pop-Location
    }
}
else {
    git clone https://github.com/morbidsteve/main-in-motion.git $InstallDir 2>&1
}

$dockerfilePath = Join-Path $InstallDir 'Dockerfile'
if (-not (Test-Path $dockerfilePath)) {
    Write-Host ('  ERROR: Clone failed - Dockerfile not found at ' + $InstallDir) -ForegroundColor Red
    Read-Host 'Press Enter to exit'
    exit 1
}
Write-Host ('  Repository ready at ' + $InstallDir) -ForegroundColor Green

# --- Build Docker image ---
Write-Host '[4/5] Building Docker image...' -ForegroundColor Yellow
Push-Location $InstallDir
docker build -t main-in-motion . 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host '  Docker build failed.' -ForegroundColor Red
    Pop-Location
    Read-Host 'Press Enter to exit'
    exit 1
}
Pop-Location
Write-Host '  Image built successfully.' -ForegroundColor Green

# --- Run container ---
Write-Host ('[5/5] Starting container on port ' + $Port + '...') -ForegroundColor Yellow

# Stop existing container if running
$existing = docker ps -a --filter 'name=main-in-motion' --format '{{.ID}}' 2>$null
if ($existing) {
    Write-Host '  Removing existing container...' -ForegroundColor Yellow
    docker rm -f main-in-motion 2>&1 | Out-Null
}

$portMapping = $Port + ':8080'
docker run -d -p $portMapping --name main-in-motion --restart unless-stopped main-in-motion 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host '  Failed to start container.' -ForegroundColor Red
    Read-Host 'Press Enter to exit'
    exit 1
}

# --- Get network IPs ---
$localIP = $null
try {
    $addresses = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue
    $dhcpAddr = $addresses | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.PrefixOrigin -eq 'Dhcp' } | Select-Object -First 1
    if ($dhcpAddr) {
        $localIP = $dhcpAddr.IPAddress
    }
    else {
        $fallback = $addresses | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notlike '169.*' -and $_.IPAddress -ne '127.0.0.1' } | Select-Object -First 1
        if ($fallback) { $localIP = $fallback.IPAddress }
    }
}
catch {}

Write-Host ''
Write-Host '========================================' -ForegroundColor Green
Write-Host '  Main In Motion is running!' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Green
Write-Host ''
Write-Host ('  Local:   http://localhost:' + $Port) -ForegroundColor White
if ($localIP) {
    Write-Host ('  Network: http://' + $localIP + ':' + $Port) -ForegroundColor White
}
Write-Host ''
Write-Host ('  Admin:   http://localhost:' + $Port + '/admin.html') -ForegroundColor White
Write-Host ''
Write-Host '  Stop:    docker stop main-in-motion' -ForegroundColor Gray
Write-Host '  Start:   docker start main-in-motion' -ForegroundColor Gray
Write-Host '  Remove:  docker rm -f main-in-motion' -ForegroundColor Gray
Write-Host ''

# Open browser
$response = Read-Host 'Open in browser? (Y/n)'
if ($response -eq '' -or $response -match '^[Yy]') {
    Start-Process ('http://localhost:' + $Port)
}

Read-Host 'Press Enter to close'
