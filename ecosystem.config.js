module.exports = {
  apps: [
    {
      name: 'filazero-mcp',
      script: 'dist/index.js',
      
      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        FILAZERO_API_URL: 'https://api.dev.filazero.net/'
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000,
        FILAZERO_API_URL: 'https://api.staging.filazero.net/',
        LOG_LEVEL: 'info'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        FILAZERO_API_URL: 'https://api.staging.filazero.net/',
        LOG_LEVEL: 'info'
      },
      
      // Process management
      instances: 1,  // Pode aumentar para 'max' em servidores com mais CPU
      exec_mode: 'fork',  // Use 'cluster' para múltiplas instâncias
      
      // Auto restart
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      
      // Logs
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Advanced features
      kill_timeout: 3000,
      listen_timeout: 3000,
      
      // Health monitoring
      health_check_grace_period: 10000,
      health_check_fatal_exceptions: true
    }
  ]
};
