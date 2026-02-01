# 🤖 NexusAI Mission Control

Dashboard de monitoramento e controle de agentes autônomos.

## ✨ Features

- 📱 **Integração WhatsApp** - Crie missões direto do WhatsApp
- 🤖 **Agentes Especializados** - speckit-master, opencode-coder, test-engineer, doc-writer
- 📊 **Monitoramento Real-time** - WebSocket para updates instantâneos
- 🗄️ **Persistência SQLite** - Banco de dados local
- 🧪 **Self-Healing** - Correção automática de erros

## 🚀 Tecnologias

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- WebSocket (ws)

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Zustand (state management)

## 📦 Instalação

```bash
# Backend
cd backend
npm install
npm start

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

## 🌐 URLs

- Dashboard: http://localhost:5174
- API: http://localhost:4105/api
- WebSocket: ws://localhost:4105/ws

## 📁 Estrutura

```
agent-orchestrator-monitor/
├── backend/
│   ├── server.js           # API + WebSocket
│   ├── database.js         # SQLite schema
│   ├── whatsapp-integration.js
│   └── data/
│       └── missions.db     # Banco de dados
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── stores/         # Zustand stores
│   │   └── hooks/          # Custom hooks
│   └── package.json
└── README.md
```

## 🎯 Agentes Disponíveis

| Agente | Função |
|--------|--------|
| speckit-master | Cria especificações técnicas |
| opencode-coder | Implementa código |
| test-engineer | Cria e executa testes |
| doc-writer | Documenta projetos |
| self-healer | Corrige erros automaticamente |

## 📝 Exemplo de Uso

Envie uma mensagem no WhatsApp:
```
"Criar uma API REST de tarefas"
```

O sistema automaticamente:
1. Cria uma missão
2. Executa os agentes em sequência
3. Notifica sobre progresso
4. Entrega o projeto completo

## 👤 Autor

Helder (heldinhow) - Criado com Clawdinho 🤙
