#!/usr/bin/env node
/**
 * Orchestrator v2 - Real-time Notifications
 * Executa agentes em sequência com notificações imediatas
 */

const { 
  reportMissionStart, 
  reportStageStart, 
  reportStageComplete, 
  reportMissionComplete,
  reportError 
} = require('./mission-reporter');

const http = require('http');

const CONFIG = {
  apiUrl: 'http://localhost:4105',
  userPhone: '+5511987269695'
};

// Criar missão via API
async function createMission(userMessage) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      userMessage,
      source: 'whatsapp',
      whatsappMessageId: 'orchestrated_' + Date.now()
    });
    
    const options = {
      hostname: 'localhost',
      port: 4105,
      path: '/api/missions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          if (!responseData) {
            reject(new Error('Empty response'));
            return;
          }
          const result = JSON.parse(responseData);
          if (result.data) {
            resolve(result.data);
          } else if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result);
          }
        } catch (err) {
          console.error('Parse error:', responseData.substring(0, 200));
          reject(err);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Atualizar progresso da missão
async function updateMissionProgress(missionId, progress, agent, message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ progress, agent, message });
    
    const options = {
      hostname: 'localhost',
      port: 4105,
      path: `/api/missions/${missionId}/progress`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => resolve(JSON.parse(responseData)));
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Executar um estágio do pipeline
async function executeStage(stageNum, totalStages, agentConfig, missionId, workDir) {
  const { name, task, duration, action } = agentConfig;
  
  // 1. NOTIFICAR INÍCIO
  reportStageStart(stageNum, totalStages, name, task);
  
  // 2. Atualizar status no dashboard
  await updateMissionProgress(missionId, (stageNum - 1) * 25, name, `Executando ${task}...`);
  
  const startTime = Date.now();
  
  try {
    // 3. EXECUTAR TAREFA
    console.log(`\n🔄 [${stageNum}/${totalStages}] Executando ${name}...`);
    
    // Simular execução (ou executar real)
    if (action) {
      await action(workDir, missionId);
    } else {
      // Simulação
      await new Promise(r => setTimeout(r, duration * 1000));
    }
    
    const actualDuration = Math.round((Date.now() - startTime) / 1000);
    
    // 4. NOTIFICAR CONCLUSÃO
    reportStageComplete(stageNum, totalStages, name, actualDuration);
    
    // 5. Atualizar progresso
    await updateMissionProgress(missionId, stageNum * 25, name, `${task} concluído`);
    
    return { success: true, duration: actualDuration };
    
  } catch (err) {
    reportError(stageNum, name, err.message);
    throw err;
  }
}

// Pipeline principal
async function runOrchestration(userMessage) {
  console.log('🎬 Iniciando Orquestração v2 - Real-time\n');
  
  // 1. CRIAR MISSÃO (imediato)
  console.log('⏳ Criando missão...');
  const mission = await createMission(userMessage);
  
  // 2. CONFIRMAR RECEBIMENTO (imediato)
  reportMissionStart(mission.id, userMessage);
  
  const totalStartTime = Date.now();
  const workDir = `/root/.openclaw/workspace/test-flow-${Date.now()}`;
  
  // Configurar pipeline
  const pipeline = [
    { 
      name: 'speckit-master', 
      task: 'Criar especificação técnica',
      duration: 60
    },
    { 
      name: 'opencode-coder', 
      task: 'Implementar código',
      duration: 120
    },
    { 
      name: 'test-engineer', 
      task: 'Criar e executar testes',
      duration: 180
    },
    { 
      name: 'doc-writer', 
      task: 'Documentar projeto',
      duration: 60
    }
  ];
  
  console.log(`\n📋 Pipeline: ${pipeline.length} etapas`);
  console.log(`📁 Diretório: ${workDir}\n`);
  
  // Executar cada etapa
  for (let i = 0; i < pipeline.length; i++) {
    await executeStage(i + 1, pipeline.length, pipeline[i], mission.id, workDir);
  }
  
  // Finalizar
  const totalDuration = Math.round((Date.now() - totalStartTime) / 1000);
  
  // Atualizar status final
  await updateMissionProgress(mission.id, 100, 'system', 'Missão completada');
  
  // Notificar conclusão
  reportMissionComplete(mission.id, totalDuration, pipeline.length);
  
  console.log('\n✅ Orquestração completa!');
  return mission;
}

// Exportar
module.exports = { runOrchestration };

// Execução direta
if (require.main === module) {
  const userMessage = process.argv[2] || 'Criar uma API REST simples';
  
  runOrchestration(userMessage)
    .then(mission => {
      console.log(`\n🎯 Missão finalizada: ${mission.id}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Erro:', err);
      process.exit(1);
    });
}
