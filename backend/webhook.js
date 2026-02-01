/**
 * NexusAI Webhook System
 * Dispara notificações em tempo real para WhatsApp quando eventos acontecem
 */

const { db } = require('./database')
const path = require('path')
const fs = require('fs')

const WEBHOOKS_DIR = __dirname + '/webhooks'
const WHATSAPP_API = 'http://localhost:4105/api/whatsapp/send'

// Garantir que diretório existe
if (!fs.existsSync(WEBHOOKS_DIR)) {
  fs.mkdirSync(WEBHOOKS_DIR, { recursive: true })
}

// Event types
const EVENTS = {
  SUBTASK_CREATED: 'subtask_created',
  SUBTASK_STARTED: 'subtask_started',
  SUBTASK_COMPLETED: 'subtask_completed',
  TASK_COMPLETED: 'task_completed',
  TASK_FAILED: 'task_failed',
  ARTIFACT_CREATED: 'artifact_created'
}

// Send WhatsApp message
async function sendWhatsApp(to, message) {
  try {
    // Usar a API do OpenClaw/WhatsApp
    const response = await fetch(WHATSAPP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: to,
        message: message
      })
    })
    return response.ok
  } catch (err) {
    console.error('WhatsApp send failed:', err.message)
    return false
  }
}

// Format message for subtask created
function formatSubtaskCreated(subtask, task) {
  const agentEmoji = getAgentEmoji(subtask.agent_id)
  return `${agentEmoji} *Etapa Iniciada*\n\n` +
    `📋 Task: ${task.user_message.slice(0, 50)}...\n` +
    `🤖 Agente: ${subtask.agent_name}\n` +
    `⚡ Stage: ${subtask.stage}\n` +
    `🆔 ${task.id}`
}

// Format message for subtask completed
function formatSubtaskCompleted(subtask, task) {
  const agentEmoji = getAgentEmoji(subtask.agent_id)
  const duration = subtask.duration_seconds 
    ? `${Math.floor(subtask.duration_seconds / 60)}m ${subtask.duration_seconds % 60}s` 
    : '-'
  
  return `${agentEmoji} *Etapa Concluída*\n\n` +
    `📋 Task: ${task.user_message.slice(0, 50)}...\n` +
    `🤖 Agente: ${subtask.agent_name}\n` +
    `⏱️ Duração: ${duration}\n` +
    `🆔 ${task.id}`
}

// Format message for task completed
function formatTaskCompleted(task, subtasks) {
  const completedCount = subtasks.filter(s => s.status === 'completed').length
  const failedCount = subtasks.filter(s => s.status === 'failed').length
  const totalDuration = subtasks
    .filter(s => s.duration_seconds)
    .reduce((acc, s) => acc + s.duration_seconds, 0)
  
  const totalDurationStr = totalDuration 
    ? `${Math.floor(totalDuration / 60)}m ${totalDuration % 60}s` 
    : '-'

  return `🎉 *Task Concluída!*\n\n` +
    `📝 ${task.user_message.slice(0, 80)}...\n\n` +
    `📊 Resumo:\n` +
    `   ✅ Concluídas: ${completedCount}\n` +
    `   ❌ Falhas: ${failedCount}\n` +
    `   ⏱️ Tempo Total: ${totalDurationStr}\n` +
    `🆔 ${task.id}`
}

// Get emoji for agent
function getAgentEmoji(agentId) {
  const emojis = {
    'opencode-coder': '💻',
    'test-engineer': '🧪',
    'doc-writer': '📝',
    'nexus-orchestrator': '🎯',
    'self-healer': '🏥',
    'speckit-master': '🛠️',
    'agent-orchestrator': '🤖'
  }
  return emojis[agentId] || '⚡'
}

// Main webhook handler
async function triggerWebhook(eventType, data) {
  console.log(`🔔 Webhook triggered: ${eventType}`)
  
  const { subtask, task } = data
  
  // Get WhatsApp number from task or use default
  const whatsappTo = '+5511987269695' // Helder
  
  let message = null
  
  switch (eventType) {
    case EVENTS.SUBTASK_CREATED:
    case EVENTS.SUBTASK_STARTED:
      message = formatSubtaskCreated(subtask, task)
      break
      
    case EVENTS.SUBTASK_COMPLETED:
      message = formatSubtaskCompleted(subtask, task)
      break
      
    case EVENTS.TASK_COMPLETED:
      const subtasks = db.prepare('SELECT * FROM subtasks WHERE task_id = ?').all(task.id)
      message = formatTaskCompleted(task, subtasks)
      break
      
    case EVENTS.TASK_FAILED:
      message = `❌ *Task Falhou*\n\n📋 ${task.user_message}\n🆔 ${task.id}`
      break
      
    case EVENTS.ARTIFACT_CREATED:
      // Optional: notify on new artifacts
      return // Skip artifact notifications for now
      
    default:
      return
  }
  
  if (message) {
    const sent = await sendWhatsApp(whatsappTo, message)
    if (sent) {
      console.log(`✅ WhatsApp notification sent: ${eventType}`)
    } else {
      console.log(`❌ WhatsApp notification failed: ${eventType}`)
    }
  }
}

// Export for use in other modules
module.exports = {
  triggerWebhook,
  EVENTS,
  sendWhatsApp
}
