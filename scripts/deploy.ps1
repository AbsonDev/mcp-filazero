# Script de deploy para Windows PowerShell
# Execução: .\scripts\deploy.ps1

Write-Host "🚀 Iniciando deploy do Filazero MCP Server..." -ForegroundColor Green

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script no diretório raiz do projeto" -ForegroundColor Red
    exit 1
}

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js versão: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale Node.js 18+ primeiro." -ForegroundColor Red
    exit 1
}

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm ci --only=production

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao instalar dependências" -ForegroundColor Red
    exit 1
}

# Build da aplicação
Write-Host "🔨 Compilando aplicação..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha no build" -ForegroundColor Red
    exit 1
}

# Verificar se build foi bem-sucedido
if (-not (Test-Path "dist\index.js")) {
    Write-Host "❌ Build falhou - arquivo dist\index.js não encontrado" -ForegroundColor Red
    exit 1
}

# Criar diretório de logs se não existir
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

Write-Host "✅ Deploy preparado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Para executar em produção, escolha uma opção:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🔄 Com PM2 (recomendado para Linux/Mac):" -ForegroundColor White
Write-Host "   npm install -g pm2" -ForegroundColor Gray
Write-Host "   pm2 start ecosystem.config.js --env production" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🐳 Com Docker:" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🖥️ Diretamente (desenvolvimento):" -ForegroundColor White
Write-Host "   `$env:NODE_ENV='production'; npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🔧 Como serviço Windows:" -ForegroundColor White
Write-Host "   Consulte DEPLOY_PRODUCAO.md para instruções completas" -ForegroundColor Gray
Write-Host ""

# Opção para executar imediatamente
$choice = Read-Host "Deseja executar o servidor agora? (y/N)"
if ($choice -eq 'y' -or $choice -eq 'Y') {
    Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
    $env:NODE_ENV = 'production'
    $env:ENABLE_HEALTH_CHECK = 'true'
    npm start
}
