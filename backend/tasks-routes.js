// Tasks API Routes
// Adicionar ao server.js existente

const { db } = require('./database');
const { triggerWebhook, EVENTS } = require('./webhook');

// GET /api/tasks - Listar todas as tasks
global.app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    const total = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;
    
    res.json({
      data: tasks,
      meta: { total },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error listing tasks:', error);
    res.status(500).json({ error: 'Failed to list tasks: ' + error.message });
  }
});

// GET /api/tasks/:id - Detalhe de uma task
global.app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Buscar subtasks
    const subtasks = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY start_time').all(req.params.id);
    
    // Buscar artefatos
    const artifacts = db.prepare('SELECT * FROM artifacts WHERE task_id = ? ORDER BY created_at').all(req.params.id);
    
    res.json({
      data: {
        id: task.id,
        userMessage: task.user_message,
        source: task.source,
        whatsappMessageId: task.whatsapp_message_id,
        timestamp: task.created_at,
        status: task.status,
        progress: task.progress,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        subtasks: subtasks.map(s => ({
          id: s.id,
          agentId: s.agent_id,
          agentName: s.agent_name,
          stage: s.stage,
          status: s.status,
          startTime: s.start_time,
          endTime: s.end_time,
          durationSeconds: s.duration_seconds,
          taskDescription: s.task_description
        })),
        artifacts: artifacts.map(a => ({
          id: a.id,
          path: a.file_path,
          type: a.file_type,
          description: a.description,
          size: a.file_size,
          createdBy: a.created_by,
          createdAt: a.created_at
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ error: 'Failed to get task' });
  }
});

// GET /api/tasks/:id/subtasks - Subtasks de uma task
global.app.get('/api/tasks/:id/subtasks', async (req, res) => {
  try {
    const subtasks = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY start_time').all(req.params.id);
    
    res.json({
      data: subtasks.map(s => ({
        id: s.id,
        taskId: s.task_id,
        agentId: s.agent_id,
        agentName: s.agent_name,
        stage: s.stage,
        status: s.status,
        startTime: s.start_time,
        endTime: s.end_time,
        durationSeconds: s.duration_seconds,
        taskDescription: s.task_description
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting subtasks:', error);
    res.status(500).json({ error: 'Failed to get subtasks' });
  }
});

// GET /api/tasks/:id/artifacts - Artefatos de uma task
global.app.get('/api/tasks/:id/artifacts', async (req, res) => {
  try {
    const artifacts = db.prepare('SELECT * FROM artifacts WHERE task_id = ? ORDER BY created_at').all(req.params.id);
    
    res.json({
      data: artifacts.map(a => ({
        id: a.id,
        subtaskId: a.subtask_id,
        path: a.file_path,
        type: a.file_type,
        size: a.file_size,
        description: a.description,
        createdBy: a.created_by,
        createdAt: a.created_at
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting artifacts:', error);
    res.status(500).json({ error: 'Failed to get artifacts' });
  }
});

// POST /api/tasks - Criar nova task
global.app.post('/api/tasks', async (req, res) => {
  try {
    const { userMessage, source, whatsappMessageId } = req.body;
    
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO tasks (id, user_message, source, whatsapp_message_id, status, progress, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'pending', 0, ?, ?)
    `).run(taskId, userMessage, source || 'whatsapp', whatsappMessageId, now, now);
    
    res.status(201).json({
      data: {
        id: taskId,
        userMessage,
        source: source || 'whatsapp',
        whatsappMessageId,
        timestamp: now,
        status: 'pending',
        progress: 0
      }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// POST /api/tasks/:id/subtasks - Adicionar subtask
global.app.post('/api/tasks/:id/subtasks', async (req, res) => {
  try {
    const { agentId, agentName, stage, taskDescription } = req.body;
    
    const result = db.prepare(`
      INSERT INTO subtasks (task_id, agent_id, agent_name, stage, status, start_time, task_description)
      VALUES (?, ?, ?, ?, 'running', ?, ?)
    `).run(req.params.id, agentId, agentName || agentId, stage || 'executed', new Date().toISOString(), taskDescription);
    
    const subtask = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(result.lastInsertRowid);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    
    // Disparar webhook para notificação em tempo real
    triggerWebhook(EVENTS.SUBTASK_CREATED, { subtask, task });
    
    res.status(201).json({
      data: {
        id: result.lastInsertRowid,
        taskId: req.params.id,
        agentId,
        agentName: agentName || agentId,
        stage: stage || 'executed',
        status: 'running',
        startTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(500).json({ error: 'Failed to create subtask' });
  }
});

// PATCH /api/tasks/:id/subtasks/:subtaskId - Atualizar subtask
global.app.patch('/api/tasks/:id/subtasks/:subtaskId', async (req, res) => {
  try {
    const { status, endTime } = req.body;
    
    // Obter subtask atual primeiro
    let subtask = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }
    
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    const wasCompleted = subtask.status === 'completed';
    
    // Atualizar status se fornecido
    if (status && status !== subtask.status) {
      db.prepare('UPDATE subtasks SET status = ? WHERE id = ?').run(status, req.params.subtaskId);
    }
    
    // Atualizar end_time se necessário
    if ((endTime || status === 'completed') && !subtask.end_time) {
      const end = endTime || new Date().toISOString();
      // Calcular duration_seconds manualmente
      const startTime = new Date(subtask.start_time).getTime();
      const endTimeMs = new Date(end).getTime();
      const durationSeconds = Math.round((endTimeMs - startTime) / 1000);
      
      db.prepare('UPDATE subtasks SET end_time = ?, duration_seconds = ? WHERE id = ? AND end_time IS NULL')
        .run(end, durationSeconds, req.params.subtaskId);
    }
    
    // Obter subtask atualizada
    subtask = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(req.params.subtaskId);
    
    // Disparar webhook se subtask foi completada
    if (subtask && subtask.status === 'completed' && !wasCompleted) {
      triggerWebhook(EVENTS.SUBTASK_COMPLETED, { subtask, task });
      
      // Verificar se todas as subtasks foram completadas
      const allSubtasks = db.prepare('SELECT * FROM subtasks WHERE task_id = ?').all(task.id);
      const allCompleted = allSubtasks.every(s => s.status === 'completed' || s.status === 'cancelled');
      
      if (allCompleted) {
        db.prepare('UPDATE tasks SET status = ?, progress = 100, updated_at = ? WHERE id = ?').run('completed', new Date().toISOString(), task.id);
        triggerWebhook(EVENTS.TASK_COMPLETED, { task: { ...task, status: 'completed' }, subtasks: allSubtasks });
      } else {
        // Atualizar progresso
        const completed = allSubtasks.filter(s => s.status === 'completed').length;
        const progress = Math.round((completed / allSubtasks.length) * 100);
        db.prepare('UPDATE tasks SET status = ?, progress = ?, updated_at = ? WHERE id = ?').run('in_progress', progress, new Date().toISOString(), task.id);
      }
    }
    
    res.json({ data: subtask });
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ error: 'Failed to update subtask' });
  }
});

// POST /api/tasks/:id/artifacts - Adicionar artefato
global.app.post('/api/tasks/:id/artifacts', async (req, res) => {
  try {
    const { filePath, fileType, description, createdBy, subtaskId } = req.body;
    
    const result = db.prepare(`
      INSERT INTO artifacts (task_id, subtask_id, file_path, file_type, description, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.id, subtaskId || null, filePath, fileType || 'file', description, createdBy, new Date().toISOString());
    
    res.status(201).json({
      data: {
        id: result.lastInsertRowid,
        taskId: req.params.id,
        subtaskId,
        path: filePath,
        type: fileType || 'file',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating artifact:', error);
    res.status(500).json({ error: 'Failed to create artifact' });
  }
});

console.log('✅ Tasks API routes loaded');
