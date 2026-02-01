/**
 * Real-time Mission Reporter
 * Notifica usuário em cada etapa do fluxo
 */

const http = require('http');

const CONFIG = {
  userPhone: '+5511987269695',
  dashboardUrl: 'http://76.13.101.17:5174'
};

// Simular envio de mensagem WhatsApp (integração real viria aqui)
function sendWhatsAppMessage(message) {
  console.log(`\n📱 [WhatsApp → ${CONFIG.userPhone}]`);
  console.log(message);
  console.log('');
  
  // Em produção, isso chamaria a API real do WhatsApp
  // message.send({ to: CONFIG.userPhone, text: message });
}

// Reportar início de missão
function reportMissionStart(missionId, userMessage) {
  sendWhatsAppMessage(
    `🎯 *Nova Missão Criada!*\n\n` +
    `ID: #${missionId.slice(-6)}\n` +
    `Tarefa: "${userMessage.substring(0, 80)}${userMessage.length > 80 ? '...' : ''}"\n\n` +
    `⏳ Iniciando execução dos agentes...\n` +
    `📊 Acompanhe: ${CONFIG.dashboardUrl}`
  );
}

// Reportar início de etapa
function reportStageStart(stageNumber, totalStages, agentName, task) {
  sendWhatsAppMessage(
    `🔄 *Etapa ${stageNumber}/${totalStages}*\n\n` +
    `🤖 Agente: ${agentName}\n` +
    `📝 Tarefa: ${task}\n\n` +
    `⏳ Executando...`
  );
}

// Reportar conclusão de etapa
function reportStageComplete(stageNumber, totalStages, agentName, duration, details = '') {
  sendWhatsAppMessage(
    `✅ *Etapa ${stageNumber}/${totalStages} Concluída!*\n\n` +
    `🤖 Agente: ${agentName}\n` +
    `⏱️ Duração: ${duration}s\n` +
    `${details ? `📋 ${details}\n` : ''}\n` +
    (stageNumber < totalStages 
      ? `🚀 Prosseguindo para próxima etapa...` 
      : `🏁 Finalizando...`)
  );
}

// Reportar missão completa
function reportMissionComplete(missionId, totalDuration, artifacts) {
  sendWhatsAppMessage(
    `🎉 *Missão Completa!* 🎉\n\n` +
    `ID: #${missionId.slice(-6)}\n` +
    `⏱️ Tempo total: ${Math.round(totalDuration / 60)}min\n` +
    `📦 Artefatos: ${artifacts} arquivos\n\n` +
    `✅ Todos os agentes executaram com sucesso!\n\n` +
    `📊 Veja o resultado: ${CONFIG.dashboardUrl}\n` +
    `📁 Arquivos: /root/.openclaw/workspace/test-flow-complete/`
  );
}

// Reportar erro
function reportError(stageNumber, agentName, error) {
  sendWhatsAppMessage(
    `❌ *Erro na Etapa ${stageNumber}*\n\n` +
    `🤖 Agente: ${agentName}\n` +
    `⚠️ Erro: ${error.substring(0, 100)}\n\n` +
    `🔧 Tentando recuperar...`
  );
}

module.exports = {
  reportMissionStart,
  reportStageStart,
  reportStageComplete,
  reportMissionComplete,
  reportError,
  sendWhatsAppMessage
};

// Teste
if (require.main === module) {
  console.log('🧪 Testando reporter...\n');
  
  reportMissionStart('mission_test_12345', 'Criar uma API de tarefas');
  
  setTimeout(() => {
    reportStageStart(1, 4, 'speckit-master', 'Criar especificação');
  }, 1000);
  
  setTimeout(() => {
    reportStageComplete(1, 4, 'speckit-master', 45, 'spec.json criado');
  }, 2000);
}
