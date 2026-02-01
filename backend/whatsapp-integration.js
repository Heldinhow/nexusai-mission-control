/**
 * WhatsApp Integration Module
 * Cria missões automaticamente quando usuário manda mensagem
 */

const http = require('http');

const CONFIG = {
  apiUrl: 'http://localhost:4105',
  userPhone: '+5511987269695',
  allowedSources: ['whatsapp']
};

// Criar missão via API interna
async function createMission(userMessage, whatsappMessageId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      userMessage,
      source: 'whatsapp',
      whatsappMessageId
    });
    
    const options = {
      hostname: 'localhost',
      port: 4105,
      path: '/api/missions',
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
          if (res.statusCode === 201) {
            console.log(`✅ Missão criada: ${result.data.id}`);
            resolve(result.data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Verificar se mensagem deve criar missão
function shouldCreateMission(message) {
  // Ignorar mensagens muito curtas
  if (!message || message.length < 5) return false;
  
  // Ignorar comandos do sistema
  const ignorePatterns = [
    /^\/\w+/,  // Comandos /status, /help, etc
    /^(status|help|oi|olá|ola|hey|hi)$/i,  // Saudações simples
  ];
  
  for (const pattern of ignorePatterns) {
    if (pattern.test(message.trim())) return false;
  }
  
  return true;
}

// Processar mensagem do WhatsApp
async function processWhatsAppMessage(message, messageId, from) {
  // Verificar se é do usuário correto
  if (from !== CONFIG.userPhone) {
    console.log(`⏭️  Ignorando mensagem de ${from}`);
    return null;
  }
  
  // Verificar se deve criar missão
  if (!shouldCreateMission(message)) {
    console.log(`⏭️  Mensagem ignorada: "${message.substring(0, 50)}..."`);
    return null;
  }
  
  console.log(`📱 Nova mensagem de ${from}:`);
  console.log(`   "${message.substring(0, 80)}..."`);
  
  try {
    const mission = await createMission(message, messageId);
    console.log(`🎯 Missão criada com sucesso!`);
    console.log(`   ID: ${mission.id}`);
    console.log(`   Status: ${mission.status}`);
    return mission;
  } catch (err) {
    console.error(`❌ Erro ao criar missão:`, err.message);
    return null;
  }
}

// Exportar para uso externo
module.exports = {
  processWhatsAppMessage,
  createMission,
  shouldCreateMission,
  CONFIG
};

// Se executado diretamente, modo de teste
if (require.main === module) {
  console.log('🧪 Testando WhatsApp Integration...');
  
  // Simular mensagem
  const testMessage = 'Cria um script Python para scrape de dados';
  const testId = 'test_' + Date.now();
  
  processWhatsAppMessage(testMessage, testId, CONFIG.userPhone)
    .then(mission => {
      if (mission) {
        console.log('\n✅ Teste passou!');
        process.exit(0);
      } else {
        console.log('\n❌ Teste falhou');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('\n❌ Erro no teste:', err);
      process.exit(1);
    });
}
