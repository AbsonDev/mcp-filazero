# 🚀 Exemplos Práticos - MCP Filazero

## 🎯 **Cenários Reais de Uso**

### **Scenario 1: Criar Ticket Completo**
```javascript
// JavaScript - Criar ticket para cliente
async function criarTicketFilazero() {
  const response = await fetch('https://mcp-filazero.vercel.app/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool: 'create_ticket',
      arguments: {
        pid: 906, // Artesano
        locationId: 1,
        serviceId: 123,
        customer: {
          name: 'Maria Silva',
          phone: '(11) 98765-4321',
          email: 'maria@email.com'
        },
        browserUuid: crypto.randomUUID(),
        terminalSchedule: {
          id: 1,
          publicAccessKey: 'ABC123',
          sessions: [{
            id: 1,
            start: '2025-08-10T09:00:00.000Z',
            end: '2025-08-10T18:00:00.000Z',
            hasSlotsLeft: true
          }]
        }
      }
    })
  });
  
  const result = await response.json();
  console.log('Ticket criado:', result.data);
  return result.data;
}
```

### **Scenario 2: Monitorar Fila**
```python
# Python - Monitorar posição na fila
import requests
import time

def monitorar_fila(provider_id, ticket_id):
    while True:
        response = requests.post('https://mcp-filazero.vercel.app/mcp', 
            json={
                'tool': 'get_queue_position',
                'arguments': {
                    'providerId': provider_id,
                    'ticketId': ticket_id
                }
            }
        )
        
        data = response.json()
        if data['success']:
            posicao = data['data']
            print(f"Posição na fila: {posicao}")
            
            if posicao.get('position') == 1:
                print("🎉 Próximo a ser atendido!")
                break
        
        time.sleep(30)  # Verificar a cada 30 segundos

# Uso
monitorar_fila(906, 12345)
```

### **Scenario 3: Dashboard de Terminais**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard Filazero</title>
    <style>
        .terminal { margin: 10px; padding: 15px; border: 1px solid #ccc; }
        .online { background: #d4edda; }
        .offline { background: #f8d7da; }
    </style>
</head>
<body>
    <h1>Dashboard Terminais Filazero</h1>
    <div id="terminais"></div>

    <script>
        async function buscarTerminal(accessKey) {
            try {
                const response = await fetch('https://mcp-filazero.vercel.app/mcp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tool: 'get_terminal',
                        arguments: { accessKey }
                    })
                });
                
                const result = await response.json();
                return result;
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        async function atualizarDashboard() {
            const terminais = ['ABC123', 'DEF456', 'GHI789'];
            const container = document.getElementById('terminais');
            container.innerHTML = '';

            for (const accessKey of terminais) {
                const result = await buscarTerminal(accessKey);
                const div = document.createElement('div');
                div.className = `terminal ${result.success ? 'online' : 'offline'}`;
                
                div.innerHTML = `
                    <h3>Terminal: ${accessKey}</h3>
                    <p>Status: ${result.success ? '🟢 Online' : '🔴 Offline'}</p>
                    <p>Última atualização: ${new Date().toLocaleString()}</p>
                `;
                
                container.appendChild(div);
            }
        }

        // Atualizar a cada 60 segundos
        setInterval(atualizarDashboard, 60000);
        atualizarDashboard(); // Inicial
    </script>
</body>
</html>
```

### **Scenario 4: Bot Telegram**
```javascript
// Node.js - Bot Telegram para consultar fila
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot('YOUR_TELEGRAM_TOKEN', {polling: true});

bot.onText(/\/posicao (\d+) (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const providerId = parseInt(match[1]);
    const ticketId = parseInt(match[2]);
    
    try {
        const response = await fetch('https://mcp-filazero.vercel.app/mcp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tool: 'get_queue_position',
                arguments: { providerId, ticketId }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const posicao = result.data.position || 'N/A';
            bot.sendMessage(chatId, `🎫 Sua posição na fila: ${posicao}`);
        } else {
            bot.sendMessage(chatId, '❌ Erro ao consultar posição');
        }
    } catch (error) {
        bot.sendMessage(chatId, '❌ Erro de conexão');
    }
});

bot.onText(/\/checkin (.+) (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const smartCode = match[1];
    const providerId = parseInt(match[2]);
    
    try {
        const response = await fetch('https://mcp-filazero.vercel.app/mcp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tool: 'checkin_ticket',
                arguments: { smartCode, providerId }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            bot.sendMessage(chatId, '✅ Check-in realizado com sucesso!');
        } else {
            bot.sendMessage(chatId, '❌ Erro no check-in');
        }
    } catch (error) {
        bot.sendMessage(chatId, '❌ Erro de conexão');
    }
});

console.log('Bot Telegram iniciado!');
```

### **Scenario 5: Excel/Google Sheets Integration**
```javascript
// Google Apps Script - Para Google Sheets
function buscarDadosFilazero() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const accessKeys = ['ABC123', 'DEF456', 'GHI789'];
  
  // Limpar dados anteriores
  sheet.getRange('A1:D10').clear();
  
  // Headers
  sheet.getRange('A1:D1').setValues([
    ['Terminal', 'Status', 'Provider', 'Última Atualização']
  ]);
  
  let row = 2;
  
  for (const accessKey of accessKeys) {
    try {
      const response = UrlFetchApp.fetch('https://mcp-filazero.vercel.app/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({
          tool: 'get_terminal',
          arguments: { accessKey }
        })
      });
      
      const result = JSON.parse(response.getContentText());
      
      sheet.getRange(`A${row}:D${row}`).setValues([[
        accessKey,
        result.success ? 'Online' : 'Offline',
        result.data?.provider || 'N/A',
        new Date().toLocaleString()
      ]]);
      
      row++;
    } catch (error) {
      sheet.getRange(`A${row}:D${row}`).setValues([[
        accessKey, 'Erro', 'N/A', new Date().toLocaleString()
      ]]);
      row++;
    }
  }
}

// Executar automaticamente a cada hora
function createTrigger() {
  ScriptApp.newTrigger('buscarDadosFilazero')
    .timeBased()
    .everyHours(1)
    .create();
}
```

### **Scenario 6: React App - Gestão de Filas**
```jsx
// React - Componente de gestão de filas
import React, { useState, useEffect } from 'react';

function FilazeroManager() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const criarTicket = async (dadosCliente) => {
    setLoading(true);
    try {
      const response = await fetch('https://mcp-filazero.vercel.app/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'create_ticket',
          arguments: {
            ...dadosCliente,
            pid: 906, // Artesano
            browserUuid: crypto.randomUUID()
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setTickets(prev => [...prev, result.data]);
        alert('Ticket criado com sucesso!');
      }
    } catch (error) {
      alert('Erro ao criar ticket');
    }
    setLoading(false);
  };

  const consultarPosicao = async (ticketId) => {
    try {
      const response = await fetch('https://mcp-filazero.vercel.app/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'get_queue_position',
          arguments: { providerId: 906, ticketId }
        })
      });

      const result = await response.json();
      if (result.success) {
        return result.data.position;
      }
    } catch (error) {
      console.error('Erro ao consultar posição:', error);
    }
    return null;
  };

  return (
    <div className="filazero-manager">
      <h1>Gestão de Filas Filazero</h1>
      
      {/* Formulário de criação de ticket */}
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        criarTicket({
          locationId: 1,
          serviceId: 123,
          customer: {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email')
          }
        });
      }}>
        <input name="name" placeholder="Nome" required />
        <input name="phone" placeholder="Telefone" required />
        <input name="email" type="email" placeholder="Email" required />
        <button type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Ticket'}
        </button>
      </form>

      {/* Lista de tickets */}
      <div className="tickets-list">
        {tickets.map(ticket => (
          <TicketCard 
            key={ticket.id} 
            ticket={ticket} 
            onConsultarPosicao={consultarPosicao}
          />
        ))}
      </div>
    </div>
  );
}

function TicketCard({ ticket, onConsultarPosicao }) {
  const [posicao, setPosicao] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const pos = await onConsultarPosicao(ticket.id);
      setPosicao(pos);
    }, 30000);

    return () => clearInterval(interval);
  }, [ticket.id]);

  return (
    <div className="ticket-card">
      <h3>Ticket #{ticket.id}</h3>
      <p>Cliente: {ticket.customer?.name}</p>
      <p>Posição: {posicao || 'Carregando...'}</p>
      <button onClick={() => onConsultarPosicao(ticket.id)}>
        Atualizar Posição
      </button>
    </div>
  );
}

export default FilazezoManager;
```

---

## 🎯 **Comando Cursor/Claude**

### **Exemplos para usar no Cursor:**
```
"Use a ferramenta get_terminal para buscar informações do terminal com chave ABC123"

"Crie um ticket na fila do Artesano para o cliente João Silva, telefone (11) 99999-9999, email joao@email.com"

"Consulte a posição na fila do ticket 12345 no provider 906"

"Faça o check-in do ticket com smart code SC-ABC123 no provider 906"

"Cancele o ticket 12345 do provider 906 com motivo 'Cliente desistiu'"

"Busque as informações do serviço 123"
```

---

## 📱 **Apps Mobile - React Native**
```jsx
// React Native - Consulta de fila
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';

export default function FilazetoApp() {
  const [ticketId, setTicketId] = useState('');
  const [posicao, setPosicao] = useState(null);

  const consultarPosicao = async () => {
    if (!ticketId) return;
    
    try {
      const response = await fetch('https://mcp-filazero.vercel.app/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'get_queue_position',
          arguments: {
            providerId: 906, // Artesano
            ticketId: parseInt(ticketId)
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setPosicao(result.data.position);
      } else {
        Alert.alert('Erro', 'Não foi possível consultar a posição');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão');
    }
  };

  return (
    <View style={{padding: 20}}>
      <Text style={{fontSize: 24, marginBottom: 20}}>Filazero - Consulta de Fila</Text>
      
      <TextInput
        style={{borderWidth: 1, padding: 10, marginBottom: 20}}
        placeholder="ID do Ticket"
        value={ticketId}
        onChangeText={setTicketId}
        keyboardType="numeric"
      />
      
      <Button title="Consultar Posição" onPress={consultarPosicao} />
      
      {posicao && (
        <Text style={{marginTop: 20, fontSize: 18}}>
          🎫 Sua posição na fila: {posicao}
        </Text>
      )}
    </View>
  );
}
```

**Todas essas ferramentas agora estão disponíveis via sua URL:**
`https://mcp-filazero.vercel.app` 🚀