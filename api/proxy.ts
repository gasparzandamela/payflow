import { parse, serialize } from 'cookie';
import { withSentry } from './_lib/sentry';

export const config = {
  runtime: 'edge',
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function refreshToken(refreshToken: string, supabaseUrl: string, supabaseKey: string) {
    try {
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        return null;
    }
}

async function handler(request: Request) {
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        return new Response('Configuration Error: Missing Supabase Env Vars', { status: 500 });
    }

    // New way to extract path: take everything after /api/proxy/
    const url = new URL(request.url);
    const proxyMatch = url.pathname.match(/\/api\/proxy\/(.*)/);
    const path = proxyMatch ? proxyMatch[1] : '';
    
    // Construct target URL including original query parameters
    const targetUrl = `${supabaseUrl}/${path}${url.search}`;

    // Get Tokens
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parse(cookieHeader);
    let accessToken = cookies['sb-access-token'];
    const storedRefreshToken = cookies['sb-refresh-token'];

    // Headers
    const headers = new Headers(request.headers);
    headers.set('apikey', supabaseKey);
    headers.delete('host');
    headers.delete('cookie');
    headers.delete('connection');

    let tokenRefreshed = false;
    let newAccessToken = '';
    let newRefreshToken = '';
    let newExpiresIn = 0;

    const doFetch = async (token: string | undefined) => {
        const h = new Headers(headers);
        if (token) {
            h.set('Authorization', `Bearer ${token}`);
        } else {
             h.set('Authorization', `Bearer ${supabaseKey}`);
        }
        
        const body = ['GET', 'HEAD'].includes(request.method) ? null : request.body;
        
        return fetch(targetUrl, {
            method: request.method,
            headers: h,
            body, 
        });
    };

    if (!accessToken && storedRefreshToken) {
        const session = await refreshToken(storedRefreshToken, supabaseUrl, supabaseKey);
        if (session) {
            accessToken = session.access_token;
            newAccessToken = session.access_token;
            newRefreshToken = session.refresh_token;
            newExpiresIn = session.expires_in;
            tokenRefreshed = true;
        }
    }

    let response = await doFetch(accessToken);

    const resHeaders = new Headers(response.headers);
    if (tokenRefreshed) {
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'strict' as const,
            path: '/',
            maxAge: newExpiresIn,
        };
        const refreshOptions = { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 };
        
        resHeaders.append('Set-Cookie', serialize('sb-access-token', newAccessToken, cookieOptions));
        resHeaders.append('Set-Cookie', serialize('sb-refresh-token', newRefreshToken, refreshOptions));
    }
    
    resHeaders.delete('content-encoding');
    resHeaders.delete('content-length');
    resHeaders.delete('transfer-encoding');

    return new Response(response.body, {
        status: response.status,
        headers: resHeaders,
    });
}

export default withSentry(handler);
