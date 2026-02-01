#!/usr/bin/env node
/**
 * Cron Job: Mission Status Checker
 * Roda a cada 2 minutos para atualizar status das missões
 * 
 * Para configurar no crontab:
 * # A cada 2 minutos
 * cd /root/.openclaw/workspace/projects/agent-orchestrator-monitor/backend && node cron-check-missions.js >> /var/log/mission-cron.log 2>&1
 */

const { checkAllMissions } = require('./mission-monitor');

console.log(`\n⏰ [${new Date().toISOString()}] Cron iniciado`);

checkAllMissions()
  .then(result => {
    console.log(`✅ [${new Date().toISOString()}] Completo:`, result);
    process.exit(0);
  })
  .catch(err => {
    console.error(`❌ [${new Date().toISOString()}] Erro:`, err);
    process.exit(1);
  });
