// PM2 Production Configuration
// Run with: pm2 start ecosystem.config.cjs --env production

module.exports = {
  apps: [
    {
      // Application Configuration
      name: 'cultura-backend',
      script: './server.js',
      node_args: '--max-old-space-size=2048', // 2GB memory limit
      
      // Node.js ES Modules support
      exec_mode: 'cluster',
      instances: 'max', // Use all CPU cores (or set specific number like 2, 4)
      
      // Environment Variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto-restart Configuration
      watch: false, // Don't watch files in production
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      
      // Graceful Shutdown
      kill_timeout: 5000, // Wait 5s before force kill
      wait_ready: true, // Wait for app to be ready
      listen_timeout: 10000, // Wait 10s for app to listen
      
      // Auto-restart on Crash
      autorestart: true,
      max_restarts: 10, // Max restarts within min_uptime
      min_uptime: '10s', // Min uptime before considered started
      
      // Exponential Backoff Restart Delay
      exp_backoff_restart_delay: 100,
      
      // Advanced Features
      time: true, // Prefix logs with timestamp
      
      // Process Management
      cron_restart: '0 3 * * *', // Restart daily at 3 AM (optional)
    }
  ],
  
  // Deployment Configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/cultura.git',
      path: '/var/www/cultura/server',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.cjs --env production',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
}
