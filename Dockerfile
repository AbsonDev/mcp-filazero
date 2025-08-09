# Multi-stage build para otimizar tamanho da imagem
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY src/ src/

# Build da aplicação
RUN npm run build

# Estágio final - runtime
FROM node:18-alpine AS runtime

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S filazero -u 1001

# Instalar dependências do sistema
RUN apk add --no-cache curl

WORKDIR /app

# Copiar arquivos do builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Criar diretório de logs
RUN mkdir -p logs && chown -R filazero:nodejs logs

# Configurar usuário
USER filazero

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicialização
CMD ["node", "dist/index.js"]