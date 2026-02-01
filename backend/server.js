const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const WebSocket = require('ws');
const http = require('http');

// Import database
const { db } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const AGENTS_DIR = '/root/.openclaw/workspace/agents';

// Store WebSocket clients
const clients = new Set();

// Helper to safely read JSON
async function readJSON(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// Broadcast update to all WebSocket clients
function broadcastUpdate(type, data) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// ===== AGENTS API =====

// GET /api/agents - List all agents
app.get('/api/agents', async (req, res) => {
  try {
    const agents = [];
    
    try {
      await fs.access(AGENTS_DIR);
    } catch {
      return res.json({ data: [], meta: { page: 1, pageSize: 25, total: 0, hasMore: false } });
    }
    
    const entries = await fs.readdir(AGENTS_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const agentPath = path.join(AGENTS_DIR, entry.name);
        const status = await readJSON(path.join(agentPath, 'status.json')) || {};
        const notification = await readJSON(path.join(agentPath, 'notification.json'));
        
        agents.push({
          id: entry.name,
          name: entry.name,
          status: status.state || 'unknown',
          taskCount: status.taskCount || 0,
          createdAt: status.created_at || new Date().toISOString(),
          updatedAt: status.updated_at || new Date().toISOString(),
          completedAt: notification?.timestamp || null,
          progress: notification?.progress || null,
          isActive: status.state === 'running',
          hasNotification: !!notification,
          notification: notification || null
        });
      }
    }
    
    agents.sort((a, b) => {
      const order = { running: 0, completed: 1, idle: 2, unknown: 3 };
      return (order[a.status] || 3) - (order[b.status] || 3);
    });
    
    res.json({
      data: agents,
      meta: { page: 1, pageSize: 25, total: agents.length, hasMore: false },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error listing agents:', error);
    res.status(500).json({ error: 'Failed to list agents' });
  }
});

// ===== MISSIONS API (SQLITE) =====

// GET /api/missions - List all missions
app.get('/api/missions', async (req, res) => {
  try {
    const { status, source, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM missions WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (source) {
      query += ' AND source = ?';
      params.push(source);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const missions = db.prepare(query).all(...params);
    
    // Get total count
    const countQuery = 'SELECT COUNT(*) as total FROM missions';
    const { total } = db.prepare(countQuery).get();
    
    res.json({
      data: missions.map(m => ({
        id: m.id,
        userMessage: m.user_message,
        source: m.source,
        whatsappMessageId: m.whatsapp_message_id,
        timestamp: m.created_at,
        status: m.status,
        progress: m.progress,
        agentsInvolved: [],
        artifacts: [],
        timeline: [],
        metadata: {}
      })),
      meta: { page: 1, pageSize: 50, total, hasMore: false },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error listing missions:', error);
    res.status(500).json({ error: 'Failed to list missions' });
  }
});

// GET /api/missions/:id - Get mission by ID
app.get('/api/missions/:id', async (req, res) => {
  try {
    const mission = db.prepare('SELECT * FROM missions WHERE id = ?').get(req.params.id);
    
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    
    // Get agents
    const agents = db.prepare('SELECT * FROM mission_agents WHERE mission_id = ?').all(req.params.id);
    
    // Get artifacts
    const artifacts = db.prepare('SELECT * FROM artifacts WHERE mission_id = ?').all(req.params.id);
    
    // Get timeline events
    const events = db.prepare('SELECT * FROM timeline_events WHERE mission_id = ? ORDER BY created_at').all(req.params.id);
    
    res.json({
      data: {
        id: mission.id,
        userMessage: mission.user_message,
        source: mission.source,
        whatsappMessageId: mission.whatsapp_message_id,
        timestamp: mission.created_at,
        status: mission.status,
        progress: mission.progress,
        agentsInvolved: agents.map(a => ({
          agentId: a.agent_id,
          agentName: a.agent_name,
          status: a.status,
          startedAt: a.started_at,
          completedAt: a.completed_at,
          task: a.task_description,
          duration: a.duration_seconds
        })),
        artifacts: artifacts.map(a => ({
          id: a.artifact_id,
          path: a.file_path,
          type: a.file_type,
          description: a.description,
          createdBy: a.created_by,
          timestamp: a.created_at
        })),
        timeline: events.map(e => ({
          id: e.event_id,
          timestamp: e.created_at,
          type: e.event_type,
          agent: e.agent,
          message: e.message,
          details: JSON.parse(e.details || '{}')
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting mission:', error);
    res.status(500).json({ error: 'Failed to get mission' });
  }
});

// POST /api/missions - Create new mission
app.post('/api/missions', async (req, res) => {
  try {
    const { userMessage, source, whatsappMessageId, title, description } = req.body;
    
    const missionId = `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO missions (id, user_message, source, whatsapp_message_id, status, progress, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(missionId, userMessage, source || 'dashboard', whatsappMessageId || null, 'pending', 0, now, now);
    
    // Add initial timeline event
    db.prepare(`
      INSERT INTO timeline_events (mission_id, event_id, event_type, agent, message, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(missionId, `evt_${Date.now()}`, 'mission-created', 'system', 'Missão criada', JSON.stringify({ userMessage, source }), now);
    
    const mission = {
      id: missionId,
      userMessage,
      source: source || 'dashboard',
      whatsappMessageId: whatsappMessageId || null,
      timestamp: now,
      status: 'pending',
      progress: 0,
      agentsInvolved: [],
      artifacts: [],
      timeline: [{
        id: `evt_${Date.now()}`,
        timestamp: now,
        type: 'mission-created',
        agent: 'system',
        message: 'Missão criada',
        details: { userMessage, source }
      }]
    };
    
    broadcastUpdate('mission_created', mission);
    
    res.status(201).json({ data: mission });
  } catch (error) {
    console.error('Error creating mission:', error);
    res.status(500).json({ error: 'Failed to create mission' });
  }
});

// PATCH /api/missions/:id/progress - Update mission progress
app.patch('/api/missions/:id/progress', async (req, res) => {
  try {
    const { progress, status, agent, message, details, agentExecution } = req.body;
    const now = new Date().toISOString();
    
    // Update mission
    if (progress !== undefined) {
      db.prepare('UPDATE missions SET progress = ?, updated_at = ? WHERE id = ?')
        .run(Math.min(100, Math.max(0, progress)), now, req.params.id);
    }
    if (status) {
      db.prepare('UPDATE missions SET status = ?, updated_at = ? WHERE id = ?')
        .run(status, now, req.params.id);
    }
    
    // Add agent execution
    if (agentExecution) {
      db.prepare(`
        INSERT INTO mission_agents (mission_id, agent_id, agent_name, status, started_at, task_description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(req.params.id, agentExecution.agentId, agentExecution.agentName || agentExecution.agentId, 'running', now, agentExecution.task);
    }
    
    // Add timeline event
    if (message) {
      db.prepare(`
        INSERT INTO timeline_events (mission_id, event_id, event_type, agent, message, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(req.params.id, `evt_${Date.now()}`, 'progress-update', agent || 'system', message, JSON.stringify(details || {}), now);
    }
    
    const mission = db.prepare('SELECT * FROM missions WHERE id = ?').get(req.params.id);
    
    broadcastUpdate('mission_progress', {
      missionId: req.params.id,
      progress: mission.progress,
      status: mission.status
    });
    
    res.json({ data: mission });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// POST /api/missions/:id/agents - Add agent to mission
app.post('/api/missions/:id/agents', async (req, res) => {
  try {
    const { agentId, agentName, task, startedAt } = req.body;
    const now = startedAt || new Date().toISOString();
    
    const result = db.prepare(`
      INSERT INTO mission_agents (mission_id, agent_id, agent_name, status, started_at, task_description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.params.id, agentId, agentName || agentId, 'running', now, task);
    
    res.status(201).json({ 
      data: { id: result.lastInsertRowid, missionId: req.params.id, agentId, agentName, status: 'running' }
    });
  } catch (error) {
    console.error('Error adding agent:', error);
    res.status(500).json({ error: 'Failed to add agent' });
  }
});

// PATCH /api/missions/:id/agents/:agentId - Update agent status
app.patch('/api/missions/:id/agents/:agentId', async (req, res) => {
  try {
    const { status, completedAt, duration } = req.body;
    
    db.prepare(`
      UPDATE mission_agents 
      SET status = ?, completed_at = ?, duration_seconds = ?
      WHERE mission_id = ? AND agent_id = ?
    `).run(status, completedAt || new Date().toISOString(), duration, req.params.id, req.params.agentId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// POST /api/missions/:id/artifacts - Add artifact to mission
app.post('/api/missions/:id/artifacts', async (req, res) => {
  try {
    const { path: artifactPath, type, description, agent } = req.body;
    const now = new Date().toISOString();
    
    const result = db.prepare(`
      INSERT INTO artifacts (mission_id, artifact_id, file_path, file_type, description, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.id, `art_${Date.now()}`, artifactPath, type, description, agent, now);
    
    // Add timeline event
    db.prepare(`
      INSERT INTO timeline_events (mission_id, event_id, event_type, agent, message, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.id, `evt_${Date.now()}`, 'artifact-created', agent || 'system', `Artefato criado: ${description || artifactPath}`, JSON.stringify({ artifactId: result.lastInsertRowid }), now);
    
    res.status(201).json({ 
      data: { id: result.lastInsertRowid, missionId: req.params.id, path: artifactPath }
    });
  } catch (error) {
    console.error('Error adding artifact:', error);
    res.status(500).json({ error: 'Failed to add artifact' });
  }
});

// GET /api/missions/:id/agents - Get agents for mission
app.get('/api/missions/:id/agents', async (req, res) => {
  try {
    const agents = db.prepare('SELECT * FROM mission_agents WHERE mission_id = ?').all(req.params.id);
    
    res.json({ 
      data: agents.map(a => ({
        id: a.agent_id,
        name: a.agent_name,
        status: a.status,
        startedAt: a.started_at,
        completedAt: a.completed_at,
        task: a.task_description,
        duration: a.duration_seconds
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({ error: 'Failed to get agents' });
  }
});

// ===== WHATSAPP WEBHOOK =====
// POST /api/webhook/whatsapp - Recebe mensagens do WhatsApp e cria missões
app.post('/api/webhook/whatsapp', async (req, res) => {
  try {
    const { message, messageId, from, timestamp } = req.body;
    
    // Validar dados
    if (!message || !from) {
      return res.status(400).json({ error: 'Missing message or from' });
    }
    
    // Verificar se é o usuário autorizado
    if (from !== '+5511987269695') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Verificar se deve criar missão (ignorar comandos curtos)
    if (message.length < 5 || /^\/\w+/.test(message)) {
      return res.json({ 
        processed: false, 
        reason: 'Message too short or is a command' 
      });
    }
    
    console.log('📱 Webhook WhatsApp recebido:');
    console.log(`   De: ${from}`);
    console.log(`   Msg: "${message.substring(0, 50)}..."`);
    
    // Criar missão
    const missionId = `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO missions (id, user_message, source, whatsapp_message_id, status, progress, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(missionId, message, 'whatsapp', messageId || null, 'pending', 0, now, now);
    
    // Adicionar evento de timeline
    db.prepare(`
      INSERT INTO timeline_events (mission_id, event_id, event_type, agent, message, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(missionId, `evt_${Date.now()}`, 'mission-created', 'system', 'Missão criada via WhatsApp', JSON.stringify({ from, messageLength: message.length }), now);
    
    const mission = {
      id: missionId,
      userMessage: message,
      source: 'whatsapp',
      whatsappMessageId: messageId || null,
      timestamp: now,
      status: 'pending',
      progress: 0,
      agentsInvolved: [],
      artifacts: [],
      timeline: []
    };
    
    // Broadcast via WebSocket
    broadcastUpdate('mission_created', mission);
    
    console.log(`✅ Missão criada: ${missionId}`);
    
    res.status(201).json({
      processed: true,
      missionId: missionId,
      message: `Missão #${missionId.slice(-6)} criada com sucesso!`,
      data: mission
    });
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// POST /api/missions/check-all - Verificar status de todas as missões pendentes
app.post('/api/missions/check-all', async (req, res) => {
  try {
    const { checkAllMissions } = require('./mission-monitor');
    const result = await checkAllMissions();
    
    res.json({
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking missions:', error);
    res.status(500).json({ error: 'Failed to check missions' });
  }
});

// POST /api/missions/:id/check - Verificar status de uma missão específica
app.post('/api/missions/:id/check', async (req, res) => {
  try {
    const { checkMissionStatus } = require('./mission-monitor');
    const result = await checkMissionStatus(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    
    res.json({
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking mission:', error);
    res.status(500).json({ error: 'Failed to check mission' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const stats = db.prepare('SELECT COUNT(*) as missions FROM missions').get();
  
  res.json({ 
    status: 'ok', 
    version: '3.0-sqlite',
    database: 'SQLite',
    missions: stats.missions,
    websocket: clients.size,
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('🟢 Client connected to WebSocket');
  clients.add(ws);
  
  // Send initial data
  const missions = db.prepare('SELECT * FROM missions ORDER BY created_at DESC LIMIT 50').all();
  ws.send(JSON.stringify({ 
    type: 'initial', 
    missions: missions.map(m => ({
      id: m.id,
      userMessage: m.user_message,
      source: m.source,
      status: m.status,
      progress: m.progress,
      timestamp: m.created_at
    }))
  }));
  
  ws.on('close', () => {
    console.log('🔴 Client disconnected');
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

const PORT = 4105;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Nexus Mission Control Backend v3.0 (SQLite) on port ${PORT}`);
  console.log(`🗄️  Database: SQLite`);
  console.log(`📁 Agents: ${AGENTS_DIR}`);
  console.log(`⚡ WebSocket: ws://0.0.0.0:${PORT}/ws`);
});
