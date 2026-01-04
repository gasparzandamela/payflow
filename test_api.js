
/**
 * Teste de Integração Simples para API de Pagamentos
 * Este script verifica se os endpoints respondem corretamente a acessos não autorizados.
 */

async function testSecurity() {
  console.log('🚀 Iniciando Testes de Segurança / Modularização...');

  const endpoints = [
    { name: 'Login', url: '/api/login', method: 'POST' },
    { name: 'Logout', url: '/api/logout', method: 'POST' },
    { name: 'Process Payment', url: '/api/payments/process', method: 'POST' },
    { name: 'Proxy Auth', url: '/api/proxy/auth/v1/user', method: 'GET' }
  ];

  for (const endpoint of endpoints) {
    try {
      // Nota: Em ambiente local sem os cookies reais, esperamos 401 ou 400 para a maioria sem payload
      const response = await fetch(`http://localhost:5173${endpoint.url}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: endpoint.method === 'POST' ? JSON.stringify({}) : null
      });

      console.log(`[${endpoint.name}] Status: ${response.status}`);
      
      if (endpoint.url.includes('process') || endpoint.url.includes('proxy')) {
        if (response.status === 401) {
          console.log(`✅ ${endpoint.name} protegeu corretamente o acesso não autorizado.`);
        } else {
          console.log(`⚠️ ${endpoint.name} retornou status inesperado: ${response.status}`);
        }
      }
    } catch (err) {
      console.log(`❌ Erro ao contactar ${endpoint.name}: Servidor está rodando?`);
      break;
    }
  }

  console.log('🏁 Testes concluídos.');
}

// Rodar se o servidor estiver ativo
testSecurity();
