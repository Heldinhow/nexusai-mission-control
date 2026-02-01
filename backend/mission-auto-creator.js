/**
 * Mission Auto-Creator
 * Hook para interceptar mensagens e criar missões automaticamente
 * 
 * Uso: Adicionar ao fluxo de mensagens do OpenClaw
 */

const { processWhatsAppMessage } = require('./whatsapp-integration');

// Cache para evitar duplicatas
const processedMessages = new Set();
const MESSAGE_CACHE_SIZE = 100;

/**
 * Processa mensagem recebida e cria missão se apropriado
 * @param {string} message - Conteúdo da mensagem
 * @param {string} messageId - ID único da mensagem
 * @param {string} from - Número do remetente
 * @param {object} context - Contexto adicional
 * @returns {object|null} - Missão criada ou null
 */
async function onMessageReceived(message, messageId, from, context = {}) {
  // Verificar duplicata
  if (processedMessages.has(messageId)) {
    console.log(`⏭️  Mensagem ${messageId} já processada`);
    return null;
  }
  
  // Adicionar ao cache
  processedMessages.add(messageId);
  if (processedMessages.size > MESSAGE_CACHE_SIZE) {
    const firstKey = processedMessages.values().next().value;
    processedMessages.delete(firstKey);
  }
  
  // Criar missão
  const mission = await processWhatsAppMessage(message, messageId, from);
  
  if (mission) {
    // Retornar info para o sistema
    return {
      missionCreated: true,
      missionId: mission.id,
      message: `🎯 Missão #${mission.id.slice(-6)} criada! Acompanhe no dashboard: http://76.13.101.17:5174`
    };
  }
  
  return null;
}

/**
 * Simulação de integração com o sistema de mensagens
 * Em produção, isso seria chamado pelo handler de mensagens do WhatsApp
 */
function setupWhatsAppHook() {
  console.log('📱 WhatsApp Mission Auto-Creator ativado');
  console.log('🎯 Mensagens do Helder serão convertidas em missões automaticamente');
  
  // Aqui seria a integração real com o sistema de mensagens
  // Por exemplo, no handler do WhatsApp do OpenClaw
}

module.exports = {
  onMessageReceived,
  setupWhatsAppHook,
  processedMessages
};
