// WhatsApp integration route for Nexus Backend
// This allows sending WhatsApp messages through OpenClaw's messaging system

global.app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { to, message, preview } = req.body
    
    if (!to || !message) {
      return res.status(400).json({ error: 'to and message are required' })
    }
    
    // Usar o sistema de mensagens do OpenClaw via HTTP
    // O OpenClaw deve expor uma API ou，我们可以 usar exec para chamar o CLI
    
    // Por enquanto, logamos a mensagem
    console.log('📱 WhatsApp message queued:')
    console.log(`   To: ${to}`)
    console.log(`   Message: ${message.slice(0, 100)}...`)
    
    // Tentar enviar via fetch para o OpenClaw gateway
    try {
      const response = await fetch('http://127.0.0.1:3000/api/message/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: to,
          message: message,
          channel: 'whatsapp'
        })
      })
      
      if (response.ok) {
        console.log('✅ WhatsApp message sent via OpenClaw')
        return res.json({ success: true, method: 'openclaw' })
      }
    } catch (e) {
      // OpenClaw API não disponível, usar método alternativo
    }
    
    // Método alternativo: escrever para arquivo que o OpenClaw pode processar
    const msgFile = '/tmp/nexus-whatsapp-queue.jsonl'
    const msgEntry = {
      to,
      message,
      timestamp: new Date().toISOString(),
      channel: 'whatsapp'
    }
    require('fs').appendFileSync(msgFile, JSON.stringify(msgEntry) + '\n')
    
    console.log(`📝 Message written to queue: ${msgFile}`)
    res.json({ success: true, method: 'queued' })
    
  } catch (error) {
    console.error('WhatsApp send error:', error)
    res.status(500).json({ error: 'Failed to send WhatsApp message' })
  }
})

// Health check para webhooks
global.app.get('/api/webhook/status', (req, res) => {
  res.json({
    status: 'active',
    timestamp: new Date().toISOString(),
    events: [
      'subtask_created',
      'subtask_started',
      'subtask_completed',
      'task_completed',
      'task_failed'
    ]
  })
})

console.log('✅ WhatsApp webhook routes loaded')
