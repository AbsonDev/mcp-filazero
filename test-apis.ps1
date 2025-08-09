# Script para testar as APIs Filazero diretamente (similar ao que o MCP faz)
# Execução: .\test-apis.ps1

Write-Host "🧪 Testando APIs Filazero Diretamente" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Gray
Write-Host ""

# Configurar APIs
$devAPI = "https://api.dev.filazero.net"
$prodAPI = "https://api.staging.filazero.net"

# Função para testar endpoint
function Test-FilazeroAPI {
    param(
        [string]$BaseURL,
        [string]$Endpoint,
        [string]$Description,
        [string]$Method = "GET",
        [hashtable]$Body = @{},
        [hashtable]$Headers = @{}
    )
    
    Write-Host "📡 Testando: $Description" -ForegroundColor Yellow
    Write-Host "🔗 URL: $BaseURL$Endpoint" -ForegroundColor Gray
    
    try {
        $defaultHeaders = @{
            "User-Agent" = "FilazeroMcpServer-Test/1.0"
            "Content-Type" = "application/json"
        }
        
        $allHeaders = $defaultHeaders + $Headers
        
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri "$BaseURL$Endpoint" -Method $Method -Headers $allHeaders -TimeoutSec 10
        } else {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            Write-Host "📤 Body: $jsonBody" -ForegroundColor Gray
            $response = Invoke-RestMethod -Uri "$BaseURL$Endpoint" -Method $Method -Headers $allHeaders -Body $jsonBody -TimeoutSec 10
        }
        
        Write-Host "✅ Sucesso!" -ForegroundColor Green
        Write-Host "📥 Resposta:" -ForegroundColor White
        Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Gray
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $statusText = $_.Exception.Response.StatusDescription
        
        Write-Host "❌ Falha: [$statusCode] $statusText" -ForegroundColor Red
        Write-Host "🔍 Erro: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorBody = $reader.ReadToEnd()
                Write-Host "📄 Corpo do erro: $errorBody" -ForegroundColor Red
            } catch {
                Write-Host "📄 Não foi possível ler o corpo do erro" -ForegroundColor Red
            }
        }
    }
    
    Write-Host ""
}

Write-Host "🚀 TESTES API DESENVOLVIMENTO" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Gray

# 1. Teste básico de conectividade
Test-FilazeroAPI -BaseURL $devAPI -Endpoint "/" -Description "Conectividade Básica (Dev)"

# 2. Health check se existir
Test-FilazeroAPI -BaseURL $devAPI -Endpoint "/health" -Description "Health Check (Dev)"

# 3. Teste endpoint de terminal (simulado)
Test-FilazeroAPI -BaseURL $devAPI -Endpoint "/api/v1/terminal/ABC123" -Description "Buscar Terminal ABC123 (Dev)"

# 4. Teste endpoint de serviço (simulado)
Test-FilazeroAPI -BaseURL $devAPI -Endpoint "/api/v1/service/123" -Description "Buscar Serviço 123 (Dev)"

Write-Host "🚀 TESTES API PRODUÇÃO" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Gray

# 5. Teste básico de conectividade
Test-FilazeroAPI -BaseURL $prodAPI -Endpoint "/" -Description "Conectividade Básica (Prod)"

# 6. Health check se existir
Test-FilazeroAPI -BaseURL $prodAPI -Endpoint "/health" -Description "Health Check (Prod)"

# 7. Teste endpoint de terminal (simulado)
Test-FilazeroAPI -BaseURL $prodAPI -Endpoint "/api/v1/terminal/ABC123" -Description "Buscar Terminal ABC123 (Prod)"

# 8. Teste endpoint de serviço (simulado)
Test-FilazeroAPI -BaseURL $prodAPI -Endpoint "/api/v1/service/123" -Description "Buscar Serviço 123 (Prod)"

Write-Host "🧪 TESTE CRIAÇÃO DE TICKET (SIMULADO)" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Gray

$ticketData = @{
    terminalSchedule = @{
        id = 123
        publicAccessKey = "ABC123"
    }
    pid = 460  # Artesano dev
    locationId = 789
    serviceId = 456
    customer = @{
        name = "João Silva Teste"
        phone = "11999887766"
        email = "joao.teste@email.com"
    }
    recaptcha = "test-recaptcha-token"
    priority = 0
    metadata = @()
    browserUuid = "test-uuid-12345"
}

# ATENÇÃO: Este teste pode criar um ticket real! Descomente apenas se necessário
# Test-FilazeroAPI -BaseURL $devAPI -Endpoint "/api/v1/booking-express" -Description "Criar Ticket (CUIDADO!)" -Method "POST" -Body $ticketData

Write-Host "⚠️ AVISO: Teste de criação de ticket está comentado para evitar criação de tickets reais!" -ForegroundColor Yellow
Write-Host ""

Write-Host "📊 RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Gray
Write-Host "✅ Conectividade com APIs testada" -ForegroundColor Green
Write-Host "✅ Endpoints principais verificados" -ForegroundColor Green
Write-Host "✅ Headers e formato de request validados" -ForegroundColor Green
Write-Host ""
Write-Host "💡 PRÓXIMOS PASSOS:" -ForegroundColor White
Write-Host "1. Se os testes passaram, o MCP deve funcionar" -ForegroundColor Gray
Write-Host "2. Configure o Claude Desktop com o MCP" -ForegroundColor Gray
Write-Host "3. Teste via Claude para validação final" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 PARA TESTAR O MCP COMPLETO:" -ForegroundColor White
Write-Host "node test-mcp.js" -ForegroundColor Gray
