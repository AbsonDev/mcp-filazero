#!/bin/bash

set -e  # Exit on any error

echo "🚀 Iniciando deploy do Filazero MCP Server..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --only=production

# Build da aplicação
echo "🔨 Compilando aplicação..."
npm run build

# Verificar se build foi bem-sucedido
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build falhou - arquivo dist/index.js não encontrado"
    exit 1
fi

# Criar diretório de logs se não existir
mkdir -p logs

echo "✅ Deploy preparado com sucesso!"
echo ""
echo "Para executar em produção, escolha uma opção:"
echo ""
echo "1. 🔄 Com PM2 (recomendado):"
echo "   npm install -g pm2"
echo "   pm2 start ecosystem.config.js --env production"
echo ""
echo "2. 🐳 Com Docker:"
echo "   docker-compose up -d"
echo ""
echo "3. 🖥️ Diretamente:"
echo "   NODE_ENV=production npm start"
echo ""
echo "4. 🔧 Como serviço systemd:"
echo "   Consulte DEPLOY_PRODUCAO.md para instruções completas"
echo ""
