/**
 * PM2 Ecosystem Configuration
 * hero-compass — Node.js + Next.js deployment
 *
 * Usage:
 *   pm2 start ecosystem.config.js          # start all apps
 *   pm2 stop all                           # stop all
 *   pm2 logs                               # stream all logs
 *   pm2 monit                              # monitoring UI
 */

module.exports = {
  apps: [
    // ── Main services ──────────────────────────────────────────────────────────

    {
      name: 'hero-api',
      script: 'dist/main.js',
      cwd: './apps/api',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      env: { NODE_ENV: 'production', PORT: 3001 },
      env_development: { NODE_ENV: 'development', PORT: 3001 },
    },

    {
      name: 'hero-web',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: './apps/web',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3000 },
      env_development: { NODE_ENV: 'development', PORT: 3000 },
    },

    // ── Escalation workers (cron-style, PM2 cron_restart) ─────────────────────

    {
      name: 'worker-activity-tracker',
      script: 'src/workers/activity-tracker-escalation.ts',
      cwd: './apps/api',
      interpreter: 'tsx',
      cron_restart: '0 7 * * *',   // daily at 07:00
      autorestart: false,
      watch: false,
      env: { NODE_ENV: 'production' },
    },

    {
      name: 'worker-tpm-hazard',
      script: 'src/workers/tpm-hazard-escalation.ts',
      cwd: './apps/api',
      interpreter: 'tsx',
      cron_restart: '0 8 * * *',   // daily at 08:00
      autorestart: false,
      watch: false,
      env: { NODE_ENV: 'production' },
    },

    {
      name: 'worker-mpsheet',
      script: 'src/workers/mpsheet-reminder.ts',
      cwd: './apps/api',
      interpreter: 'tsx',
      cron_restart: '0 9 * * *',   // daily at 09:00
      autorestart: false,
      watch: false,
      env: { NODE_ENV: 'production' },
    },

    // Audit Tracker — the riskiest workflow per migration plan. Walks every
    // open audit_section and fires the 4-stage escalation matrix.
    {
      name: 'worker-audit-tracker',
      script: 'src/workers/audit-tracker-escalation.ts',
      cwd: './apps/api',
      interpreter: 'tsx',
      cron_restart: '0 7 * * *',   // daily at 07:00 (matches legacy auditNotification)
      autorestart: false,
      watch: false,
      env: { NODE_ENV: 'production' },
    },

    // SAP token refresh — legacy ran twice daily at 05:01 and 07:51.
    {
      name: 'worker-sap-token-am',
      script: 'src/workers/sap-sync.ts',
      args: 'token',
      cwd: './apps/api',
      interpreter: 'tsx',
      cron_restart: '1 5 * * *',
      autorestart: false,
      watch: false,
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'worker-sap-token-pm',
      script: 'src/workers/sap-sync.ts',
      args: 'token',
      cwd: './apps/api',
      interpreter: 'tsx',
      cron_restart: '51 7 * * *',
      autorestart: false,
      watch: false,
      env: { NODE_ENV: 'production' },
    },

    // SAP views sync — legacy ran twice daily at 05:11 and 06:21.
    {
      name: 'worker-sap-views-am',
      script: 'src/workers/sap-sync.ts',
      args: 'views',
      cwd: './apps/api',
      interpreter: 'tsx',
      cron_restart: '11 5 * * *',
      autorestart: false,
      watch: false,
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'worker-sap-views-mid',
      script: 'src/workers/sap-sync.ts',
      args: 'views',
      cwd: './apps/api',
      interpreter: 'tsx',
      cron_restart: '21 6 * * *',
      autorestart: false,
      watch: false,
      env: { NODE_ENV: 'production' },
    },
  ],
};
