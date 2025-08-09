# Script para executar localmente conectando na API de desenvolvimento
# Execução: .\start-local-dev.ps1

Write-Host "🚀 Iniciando Filazero MCP Server..." -ForegroundColor Green
Write-Host "📡 Modo: Local + API Desenvolvimento" -ForegroundColor Cyan
Write-Host ""

# Verificar se o build existe
if (-not (Test-Path "dist\index.js")) {
    Write-Host "⚠️ Build não encontrado. Compilando..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha no build!" -ForegroundColor Red
        exit 1
    }
}

# Configurar ambiente para desenvolvimento local
$env:NODE_ENV = 'development'
$env:FILAZERO_API_URL = 'https://api.dev.filazero.net/'
$env:LOG_LEVEL = 'debug'

Write-Host "🔗 API URL: $env:FILAZERO_API_URL" -ForegroundColor White
Write-Host "📊 Log Level: $env:LOG_LEVEL" -ForegroundColor White
Write-Host ""
Write-Host "💡 Pressione Ctrl+C para parar o servidor" -ForegroundColor Gray
Write-Host ""

# Iniciar servidor
npm start
