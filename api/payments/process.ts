import { parse } from 'cookie';
import { withSentry } from '../_lib/sentry';

export const config = {
  runtime: 'edge',
};

async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response('Configuration Error', { status: 500 });
  }

  const { entity, reference, amount } = await request.json();

  // 1. Validate Input
  if (!entity || !reference || !amount) {
    return new Response(JSON.stringify({ error: 'Campos obrigatórios em falta' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. Identify User via Cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  const accessToken = cookies['sb-access-token'];

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Get User info to ensure token is valid and get UID
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'Sessão inválida ou expirada' }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
      });
  }

  const userData = await userRes.json();
  const userId = userData.id;

  // 3. Logic: Check if payment is valid (Simulando uma validação extra de negócio)
  const numericAmount = parseFloat(amount.toString().replace(',', '.'));
  if (numericAmount <= 0) {
      return new Response(JSON.stringify({ error: 'Montante inválido' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
      });
  }

  // 4. Record Transaction
  const insertRes = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${accessToken}`, // Pass user token so RLS works
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      // user_id is handled by database default auth.uid()
      entity,
      reference,
      amount: numericAmount,
      description: `Pagamento de Mensalidade - Entidade ${entity}`,
      status: 'Sucesso'
    })
  });

  const resultData = await insertRes.json();

  if (!insertRes.ok) {
    console.error('Supabase Insert Error:', resultData);
    return new Response(JSON.stringify({ 
      error: 'Erro ao gravar transação', 
      message: resultData.message || 'Erro desconhecido',
      details: resultData 
    }), { 
      status: insertRes.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ 
    message: 'Pagamento processado com sucesso', 
    data: Array.isArray(resultData) ? resultData[0] : resultData 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export default withSentry(handler);

