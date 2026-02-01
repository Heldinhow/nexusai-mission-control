// Integration Module for OpenClaw
// Auto-creates missions when Helder sends WhatsApp messages

const { onWhatsAppMessage } = require('./whatsapp-forwarder');

/**
 * Call this function when a WhatsApp message is received from Helder
 * @param {string} message - The message content
 * @param {string} messageId - WhatsApp message ID
 * @returns {Promise<object|null>} - Mission info or null
 */
async function handleIncomingMessage(message, messageId) {
  // Only process messages from Helder
  const HELDER_PHONE = '+5511987269695';
  
  console.log('📱 Processing incoming WhatsApp message...');
  console.log(`   Content: "${message.substring(0, 60)}..."`);
  
  try {
    const result = await onWhatsAppMessage(message, messageId);
    
    if (result && result.missionCreated) {
      console.log(`✅ Auto-created mission: ${result.missionId}`);
      return result;
    }
    
    return null;
  } catch (err) {
    console.error('❌ Failed to process message:', err);
    return null;
  }
}

module.exports = { handleIncomingMessage };

// If this module is required by the main agent, it will use handleIncomingMessage
// Example usage in main agent:
// const { handleIncomingMessage } = require('./integration');
// const result = await handleIncomingMessage(userMessage, messageId);
// if (result) {
//   // Mission was auto-created
//   await message.reply(result.response);
// }
