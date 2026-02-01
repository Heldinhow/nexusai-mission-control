/**
 * Mission Status Monitor
 * Verifica missões pendentes e atualiza status automaticamente
 */

const { db } = require('./database');
const fs = require('fs').promises;
const path = require('path');

const AGENTS_DIR = '/root/.openclaw/workspace/agents';

// Verificar status de uma missão
async function checkMissionStatus(missionId) {
  try {
    // Buscar missão
    const mission = db.prepare('SELECT * FROM missions WHERE id = ?').get(missionId);
    if (!mission) return null;
    
    // Buscar agentes da missão
    const agents = db.prepare('SELECT * FROM mission_agents WHERE mission_id = ?').all(missionId);
    
    if (agents.length === 0) {
      // Missão sem agentes - verificar se tem mais de 30 min
      const createdAt = new Date(mission.created_at);
      const now = new Date();
      const diffMinutes = (now - createdAt) / 1000 / 60;
      
      if (diffMinutes > 30 && mission.status === 'pending') {
        // Auto-cancelar missões muito antigas sem agentes
        db.prepare('UPDATE missions SET status = ?, updated_at = ? WHERE id = ?')
          .run('cancelled', new Date().toISOString(), missionId);
        
        console.log(`🚫 Missão ${missionId} cancelada (sem agentes por ${Math.round(diffMinutes)}min)`);
        return { status: 'cancelled', reason: 'No agents assigned' };
      }
      
      return { status: mission.status, progress: mission.progress };
    }
    
    // Verificar status dos agentes no filesystem
    let completedAgents = 0;
    let runningAgents = 0;
    let failedAgents = 0;
    
    for (const agent of agents) {
      const statusPath = path.join(AGENTS_DIR, agent.agent_id, 'status.json');
      
      try {
        const statusData = await fs.readFile(statusPath, 'utf-8');
        const status = JSON.parse(statusData);
        
        if (status.state === 'completed') {
          completedAgents++;
          
          // Atualizar agent no banco se ainda não está completo
          if (agent.status !== 'completed') {
            db.prepare(`
              UPDATE mission_agents 
              SET status = ?, completed_at = ?, duration_seconds = ?
              WHERE id = ?
            `).run('completed', status.completed_at, status.duration_seconds || 0, agent.id);
          }
        } else if (status.state === 'running') {
          runningAgents++;
        } else if (status.state === 'error' || status.state === 'failed') {
          failedAgents++;
        }
      } catch (err) {
        // Arquivo não existe ou erro - manter status atual
      }
    }
    
    const totalAgents = agents.length;
    const progress = Math.round((completedAgents / totalAgents) * 100);
    
    // Determinar novo status
    let newStatus = mission.status;
    
    if (failedAgents > 0 && failedAgents === totalAgents) {
      newStatus = 'failed';
    } else if (completedAgents === totalAgents) {
      newStatus = 'completed';
    } else if (completedAgents > 0 || runningAgents > 0) {
      newStatus = 'in_progress';
    }
    
    // Atualizar missão se mudou algo
    if (newStatus !== mission.status || progress !== mission.progress) {
      const now = new Date().toISOString();
      
      db.prepare('UPDATE missions SET status = ?, progress = ?, updated_at = ? WHERE id = ?')
        .run(newStatus, progress, now, missionId);
      
      // Adicionar evento na timeline
      if (newStatus === 'completed' && mission.status !== 'completed') {
        db.prepare(`
          INSERT INTO timeline_events (mission_id, event_id, event_type, agent, message, details, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(missionId, `evt_${Date.now()}`, 'mission-completed', 'system', 
          'Missão completada automaticamente', 
          JSON.stringify({ completedAgents, totalAgents }), now);
        
        console.log(`✅ Missão ${missionId} completada! (${completedAgents}/${totalAgents} agentes)`);
      } else if (newStatus === 'in_progress' && mission.status === 'pending') {
        console.log(`🚀 Missão ${missionId} iniciada (${runningAgents} agentes rodando)`);
      }
      
      return { 
        status: newStatus, 
        progress, 
        completedAgents, 
        totalAgents,
        updated: true 
      };
    }
    
    return { status: mission.status, progress: mission.progress, completedAgents, totalAgents };
    
  } catch (err) {
    console.error(`❌ Erro ao verificar missão ${missionId}:`, err.message);
    return null;
  }
}

// Verificar todas as missões pendentes/em progresso
async function checkAllMissions() {
  console.log('\n🔍 Verificando missões...');
  
  const missions = db.prepare(`
    SELECT id, status, user_message 
    FROM missions 
    WHERE status IN ('pending', 'in_progress')
    ORDER BY created_at DESC
  `).all();
  
  console.log(`📋 ${missions.length} missões para verificar`);
  
  let updated = 0;
  let completed = 0;
  
  for (const mission of missions) {
    const result = await checkMissionStatus(mission.id);
    
    if (result && result.updated) {
      updated++;
      if (result.status === 'completed') completed++;
    }
  }
  
  if (updated > 0) {
    console.log(`✅ ${updated} missões atualizadas (${completed} completadas)`);
  } else {
    console.log('⏭️  Nenhuma alteração');
  }
  
  return { checked: missions.length, updated, completed };
}

// Executar verificação (se chamado diretamente)
if (require.main === module) {
  checkAllMissions()
    .then(result => {
      console.log('\n✅ Verificação completa');
      console.log(result);
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Erro:', err);
      process.exit(1);
    });
}

module.exports = { checkMissionStatus, checkAllMissions };
