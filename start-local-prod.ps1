# Script para executar localmente conectando na API de produção
# Execução: .\start-local-prod.ps1

Write-Host "🚀 Iniciando Filazero MCP Server..." -ForegroundColor Green
Write-Host "📡 Modo: Local + API Produção" -ForegroundColor Cyan
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

# Configurar ambiente para produção local
$env:NODE_ENV = 'development'  # Ambiente local
$env:FILAZERO_API_URL = 'https://api.staging.filazero.net/'  # API de produção
$env:LOG_LEVEL = 'debug'  # Logs detalhados para debug local

Write-Host "🔗 API URL: $env:FILAZERO_API_URL" -ForegroundColor White
Write-Host "📊 Log Level: $env:LOG_LEVEL" -ForegroundColor White
Write-Host ""
Write-Host "💡 Pressione Ctrl+C para parar o servidor" -ForegroundColor Gray
Write-Host ""

# Iniciar servidor
npm start
