// Progress API Routes
// Permite enviar mensagens de progresso em tempo real

const { ProgressReporter } = require('./progress-reporter')

// Store para reporters ativos
const activeReporters = new Map()

// POST /api/progress/start - Iniciar reporter
global.app.post('/api/progress/start', async (req, res) => {
  try {
    const { to, taskName } = req.body
    
    if (!to || !taskName) {
      return res.status(400).json({ error: 'to and taskName are required' })
    }

    const reporter = new ProgressReporter(to, taskName)
    const reporterId = `reporter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    activeReporters.set(reporterId, reporter)
    
    res.json({
      data: {
        reporterId,
        to,
        taskName,
        startedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error starting reporter:', error)
    res.status(500).json({ error: 'Failed to start reporter' })
  }
})

// POST /api/progress/:reporterId/send - Enviar mensagem
global.app.post('/api/progress/:reporterId/send', async (req, res) => {
  try {
    const { reporterId } = req.params
    const { message, type = 'info', force } = req.body
    
    const reporter = activeReporters.get(reporterId)
    if (!reporter) {
      return res.status(404).json({ error: 'Reporter not found' })
    }

    switch (type) {
      case 'start':
        await reporter.start(message)
        break
      case 'step':
        await reporter.step(message)
        break
      case 'info':
        await reporter.info(message)
        break
      case 'success':
        await reporter.success(message)
        break
      case 'error':
        await reporter.error(message)
        break
      case 'progress':
        await reporter.progress(message.current, message.total, message.item)
        break
      case 'complete':
        await reporter.complete(message)
        activeReporters.delete(reporterId)
        break
      default:
        await reporter.send(message, force)
    }

    res.json({ success: true, message })
  } catch (error) {
    console.error('Error sending progress:', error)
    res.status(500).json({ error: 'Failed to send progress' })
  }
})

// POST /api/progress/:reporterId/step - Step simples
global.app.post('/api/progress/:reporterId/step', async (req, res) => {
  try {
    const { reporterId } = req.params
    const { message } = req.body
    
    const reporter = activeReporters.get(reporterId)
    if (!reporter) {
      return res.status(404).json({ error: 'Reporter not found' })
    }

    await reporter.step(message)
    res.json({ success: true })
  } catch (error) {
    console.error('Error sending step:', error)
    res.status(500).json({ error: 'Failed to send step' })
  }
})

// POST /api/progress/:reporterId/complete - Finalizar e limpar
global.app.post('/api/progress/:reporterId/complete', async (req, res) => {
  try {
    const { reporterId } = req.params
    const { summary } = req.body
    
    const reporter = activeReporters.get(reporterId)
    if (!reporter) {
      return res.status(404).json({ error: 'Reporter not found' })
    }

    await reporter.complete(summary)
    activeReporters.delete(reporterId)
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error completing reporter:', error)
    res.status(500).json({ error: 'Failed to complete reporter' })
  }
})

// Utility endpoint para enviar mensagem direta
global.app.post('/api/message/send', async (req, res) => {
  try {
    const { to, message, force = false } = req.body
    
    if (!to || !message) {
      return res.status(400).json({ error: 'to and message are required' })
    }

    const reporter = new ProgressReporter(to, 'Message')
    await reporter.send(message, force)
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

console.log('✅ Progress API routes loaded')
