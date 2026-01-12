import { parse } from 'cookie';
import { withSentry } from '../_lib/sentry';

export const config = {
  runtime: 'edge',
};

async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response('Configuration Error: Missing Supabase Env Vars', { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Body de requisição inválido' }), { status: 400 });
  }

  const { entity, reference, amount, paymentMethod, chargeId } = body;

  // 1. Validate Input - basic amount check
  if (!amount) {
    return new Response(JSON.stringify({ error: 'Montante em falta' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // For bank transfers, we still want these, but for mobile money they are optional
  const isBank = entity && reference;

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

  // 3. Logic: Check if payment is valid
  const numericAmount = parseFloat(amount.toString().replace(',', '.'));
  if (isNaN(numericAmount) || numericAmount <= 0) {
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
      'Authorization': `Bearer ${accessToken}`, 
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      charge_id: chargeId || null,
      entity: entity || null,
      reference: reference || null,
      amount: numericAmount,
      payment_method: paymentMethod || (isBank ? 'BANK_TRANSFER' : 'Desconhecido'),
      description: isBank 
        ? `Pagamento de Mensalidade - Entidade ${entity}`
        : `Pagamento via ${paymentMethod || 'Mobile Money'}`,
      status: 'Sucesso'
    })
  });

  const resultData = await insertRes.json();

  if (!insertRes.ok) {
    console.error('Supabase Insert Error:', resultData);
    return new Response(JSON.stringify({ 
      error: 'Erro ao gravar transação', 
      message: resultData.message || 'Erro desconhecido no banco de dados',
      details: resultData 
    }), { 
      status: insertRes.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 5. If it's a tuition payment, mark the charge as paid
  if (chargeId && chargeId !== 'undefined' && chargeId !== 'null') {
    try {
      const updateRes = await fetch(`${supabaseUrl}/rest/v1/charges?id=eq.${chargeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: 'paid' })
      });

      if (!updateRes.ok) {
          const errorText = await updateRes.text();
          console.error(`Failed to update charge ${chargeId}:`, errorText);
      } else {
          console.log(`Successfully marked charge ${chargeId} as paid`);
      }
    } catch (err) {
      console.error('Exception during charge update:', err);
    }
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
