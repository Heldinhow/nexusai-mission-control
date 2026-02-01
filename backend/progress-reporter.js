/**
 * Nexus Progress Reporter
 * Envia mensagens de progresso em tempo real para WhatsApp enquanto processa tasks
 * 
 * Uso:
 *   const reporter = new ProgressReporter(to, taskName)
 *   await reporter.start('Analisando requisição...')
 *   await reporter.step('Criando task...')
 *   await reporter.complete('Task criada com sucesso!')
 */

const MESSAGE_CACHE = new Map()
const CACHE_TTL = 5000 // 5 segundos entre mensagens similares

class ProgressReporter {
  constructor(to, taskName) {
    this.to = to
    this.taskName = taskName
    this.startTime = Date.now()
  }

  async send(message, force = false) {
    // Check cache para evitar mensagens duplicadas
    const cacheKey = this.to + '-' + message
    const now = Date.now()
    const cached = MESSAGE_CACHE.get(cacheKey)
    
    if (cached && !force && now - cached.lastTime < CACHE_TTL) {
      console.log('⏭️  Mensagem em cache: "' + message + '"')
      return
    }

    MESSAGE_CACHE.set(cacheKey, { lastMessage: message, lastTime: now })

    // Enviar via OpenClaw CLI
    try {
      const { execSync } = require('child_process')
      const escapedMessage = message.replace(/"/g, '\\"').replace(/\n/g, '\\n')
      
      execSync('openclaw message send --target "' + this.to + '" --message "' + escapedMessage + '"', {
        stdio: 'pipe',
        encoding: 'utf-8'
      })
      
      console.log('✅ Enviado: ' + message)
    } catch (err) {
      console.error('❌ Falha ao enviar: ' + err.message)
    }
  }

  async start(context) {
    await this.send('🚀 *' + this.taskName + '*\n\n' + context + '...')
  }

  async step(message) {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
    await this.send('⏱️ ' + elapsed + 's • ' + message)
  }

  async info(message) {
    await this.send('ℹ️ ' + message)
  }

  async success(message) {
    const total = Math.floor((Date.now() - this.startTime) / 1000)
    await this.send('✅ ' + message + '\n\n⏱️ Tempo total: ' + total + 's')
  }

  async error(message) {
    await this.send('❌ ' + message)
  }

  async progress(current, total, item) {
    const percent = Math.round((current / total) * 100)
    await this.send('📊 ' + current + '/' + total + ' (' + percent + '%) • ' + item)
  }

  async complete(summary) {
    const total = Math.floor((Date.now() - this.startTime) / 1000)
    await this.send('🎉 *Concluído!*\n\n' + summary + '\n\n⏱️ Tempo total: ' + total + 's')
  }
}

// Export para uso em outros módulos
module.exports = { ProgressReporter }

// Exemplo de uso:
// const reporter = new ProgressReporter('+5511987269695', 'Criando Task')
// await reporter.start('Analisando requisição...')
// await reporter.step('Criando task no banco...')
// await reporter.step('Adicionando subtasks...')
// await reporter.complete('Task criada com 4 subtasks')
