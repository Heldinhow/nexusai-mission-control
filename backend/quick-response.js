/**
 * Quick Response Handler
 * Responde imediatamente ao usuário e inicia orquestração em background
 */

const { runOrchestration } = require('./orchestrator-v2');
const { sendWhatsAppMessage } = require('./mission-reporter');

/**
 * Handle incoming message with immediate response
 * @param {string} message - User message
 * @param {string} messageId - WhatsApp message ID
 * @param {string} from - User phone number
 */
async function handleMessageQuick(message, messageId, from) {
  // Verificar se deve processar
  if (!message || message.length < 5) {
    return { processed: false, reason: 'Message too short' };
  }
  
  // Verificar se é comando
  if (/^\/\w+/.test(message)) {
    return { processed: false, reason: 'Command detected' };
  }
  
  // ⚡ RESPOSTA IMEDIATA (dentro de 2 segundos)
  sendWhatsAppMessage(
    `⚡ *Recebido!*\n\n` +
    `📝 "${message.substring(0, 60)}${message.length > 60 ? '...' : ''}"\n\n` +
    `🎯 Criando missão e iniciando agentes...\n` +
    `⏳ Você receberá updates em cada etapa!`
  );
  
  // Iniciar orquestração em background (não bloqueia resposta)
  setImmediate(async () => {
    try {
      console.log(`🚀 Iniciando orquestração para: ${message.substring(0, 50)}...`);
      await runOrchestration(message);
    } catch (err) {
      console.error('❌ Erro na orquestração:', err);
      sendWhatsAppMessage(
        `❌ *Erro na Execução*\n\n` +
        `Ocorreu um erro durante o processamento.\n` +
        `Tente novamente ou contate suporte.`
      );
    }
  });
  
  return { 
    processed: true, 
    message: 'Orquestração iniciada em background',
    response: '⚡ Recebido! Iniciando execução dos agentes...'
  };
}

module.exports = { handleMessageQuick };

// Teste
if (require.main === module) {
  const testMsg = 'Criar um sistema de login com JWT e bcrypt';
  
  console.log('🧪 Testando quick response...\n');
  console.log('Mensagem:', testMsg);
  
  handleMessageQuick(testMsg, 'test_001', '+5511987269695')
    .then(result => {
      console.log('\n✅ Resultado:', result);
    })
    .catch(console.error);
}
