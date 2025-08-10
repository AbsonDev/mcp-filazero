# Script de teste para validar o ambiente de produção
# Execução: .\scripts\test-production.ps1

Write-Host "🧪 Testando Filazero MCP Server em Produção..." -ForegroundColor Cyan
Write-Host ""

# Função para testar URL
function Test-Url {
    param([string]$Url, [string]$Description)
    
    try {
        $response = Invoke-RestMethod -Uri $Url -TimeoutSec 10
        Write-Host "✅ $Description - OK" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ $Description - FALHA: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Função para verificar processo
function Test-Process {
    param([string]$ProcessName)
    
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "✅ Processo $ProcessName rodando (PID: $($processes[0].Id))" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Processo $ProcessName não encontrado" -ForegroundColor Red
        return $false
    }
}

# Função para verificar porta
function Test-Port {
    param([int]$Port)
    
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "✅ Porta $Port está aberta" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Porta $Port está fechada" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Erro ao testar porta $Port" -ForegroundColor Red
        return $false
    }
}

$allTestsPassed = $true

Write-Host "1. 🔍 Verificando arquivos essenciais..." -ForegroundColor Yellow

# Verificar arquivos
$files = @(
    "package.json",
    "dist/index.js",
    "ecosystem.config.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file não encontrado" -ForegroundColor Red
        $allTestsPassed = $false
    }
}

Write-Host ""
Write-Host "2. 🖥️ Verificando processos Node.js..." -ForegroundColor Yellow

if (-not (Test-Process "node")) {
    Write-Host "  ⚠️ Nenhum processo Node.js detectado. Servidor pode não estar rodando." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "3. 🌐 Testando conectividade..." -ForegroundColor Yellow

# Testar APIs externas
$apiTests = @(
    @{ Url = "https://api.staging.filazero.net/"; Description = "API Filazero Produção" },
    @{ Url = "https://api.dev.filazero.net/"; Description = "API Filazero Desenvolvimento" }
)

foreach ($test in $apiTests) {
    if (-not (Test-Url $test.Url $test.Description)) {
        $allTestsPassed = $false
    }
}

Write-Host ""
Write-Host "4. 🏥 Testando Health Check..." -ForegroundColor Yellow

# Aguardar um pouco para o servidor inicializar
Start-Sleep -Seconds 2

if (Test-Port 3001) {
    if (Test-Url "http://localhost:3001/health" "Health Check Endpoint") {
        Write-Host "  📊 Health check funcionando!" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Health check endpoint não responde" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️ Health check não habilitado ou porta 3001 não está aberta" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "5. 📋 Resumo dos Testes" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

if ($allTestsPassed) {
    Write-Host "🎉 TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Servidor está pronto para produção!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Próximos passos:" -ForegroundColor White
    Write-Host "   1. Configure o servidor no Claude Desktop" -ForegroundColor Gray
    Write-Host "   2. Teste algumas tools MCP" -ForegroundColor Gray
    Write-Host "   3. Configure monitoramento se necessário" -ForegroundColor Gray
    Write-Host "   4. Configure backup automático" -ForegroundColor Gray
} else {
    Write-Host "⚠️ ALGUNS TESTES FALHARAM" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 Verifique os itens marcados com ❌ e corrija antes de usar em produção." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📚 Para mais informações, consulte:" -ForegroundColor Cyan
Write-Host "   - DEPLOY_PRODUCAO.md (guia completo)" -ForegroundColor Gray
Write-Host "   - QUICK_START_PRODUCTION.md (guia rápido)" -ForegroundColor Gray
Write-Host "   - README.md (documentação geral)" -ForegroundColor Gray
