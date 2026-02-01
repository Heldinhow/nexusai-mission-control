#!/usr/bin/env node
/**
 * WhatsApp Message Forwarder
 * Envia mensagens recebidas para o webhook do Mission Control
 * 
 * Isso seria integrado ao sistema de mensagens do OpenClaw
 */

const http = require('http');

const CONFIG = {
  webhookUrl: 'http://localhost:4105/api/webhook/whatsapp',
  userPhone: '+5511987269695'
};

// Enviar mensagem para o webhook
async function forwardToWebhook(message, messageId, from) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message,
      messageId,
      from,
      timestamp: new Date().toISOString()
    });
    
    const url = new URL(CONFIG.webhookUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (err) {
          resolve({ processed: false, raw: responseData });
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Função principal que seria chamada quando receber mensagem
async function onWhatsAppMessage(message, messageId) {
  console.log('📤 Encaminhando mensagem para Mission Control...');
  
  try {
    const result = await forwardToWebhook(message, messageId, CONFIG.userPhone);
    
    if (result.processed) {
      console.log(`✅ Missão criada: ${result.missionId}`);
      return {
        missionCreated: true,
        missionId: result.missionId,
        response: `🎯 Missão criada! ID: ${result.missionId.slice(-6)}\nAcompanhe em: http://76.13.101.17:5174`
      };
    } else {
      console.log(`⏭️  Mensagem não criou missão: ${result.reason || 'unknown'}`);
      return null;
    }
  } catch (err) {
    console.error('❌ Erro ao encaminhar:', err.message);
    return null;
  }
}

// Teste
if (require.main === module) {
  const testMessage = process.argv[2] || 'Criar um dashboard de analytics';
  const testId = 'msg_' + Date.now();
  
  console.log('🧪 Testando forward de mensagem...');
  console.log(`Mensagem: "${testMessage}"`);
  
  onWhatsAppMessage(testMessage, testId)
    .then(result => {
      if (result) {
        console.log('\n✅ Sucesso!');
        console.log(result.response);
      } else {
        console.log('\n⏭️  Mensagem processada mas não criou missão');
      }
    })
    .catch(console.error);
}

module.exports = { onWhatsAppMessage, forwardToWebhook };
