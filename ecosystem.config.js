module.exports = {
  apps: [
    {
      name: 'nexus-backend',
      cwd: '/root/.openclaw/workspace/projects/agent-orchestrator-monitor/backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        PORT: 4105
      },
      log_file: '/root/.pm2/logs/nexus-backend.log',
      out_file: '/root/.pm2/logs/nexus-backend-out.log',
      error_file: '/root/.pm2/logs/nexus-backend-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: false,
      ignore_watch: ['node_modules', 'data'],
      autorestart: true
    },
    {
      name: 'nexus-frontend',
      cwd: '/root/.openclaw/workspace/projects/agent-orchestrator-monitor/frontend',
      script: 'node_modules/.bin/vite',
      args: '--port 5174 --host',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '300M',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production'
      },
      log_file: '/root/.pm2/logs/nexus-frontend.log',
      out_file: '/root/.pm2/logs/nexus-frontend-out.log',
      error_file: '/root/.pm2/logs/nexus-frontend-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: false,
      autorestart: true
    }
  ]
};
