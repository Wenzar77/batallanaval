# start-app.ps1
# Script para ejecutar backend y frontend juntos

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando Backend y Frontend..."

# Rutas relativas (ajústalas si tus carpetas se llaman diferente)
$backendPath = ".\backend"
$frontendPath = ".\frontend"

# Ejecuta backend en una nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $backendPath; npm run start" -WindowStyle Normal

# Ejecuta frontend en otra nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $frontendPath; npm run dev" -WindowStyle Normal

Write-Host "✅ Backend y Frontend lanzados en ventanas separadas."
