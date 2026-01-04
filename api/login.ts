import { serialize } from 'cookie';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email, password } = await request.json();
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response('Server configuration error', { status: 500 });
    }

    const authUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
    
    // Call Supabase Auth
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await authResponse.json();

    if (!authResponse.ok) {
      return new Response(JSON.stringify(data), { 
        status: authResponse.status, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { access_token, refresh_token, expires_in } = data;

    // Set Cookies with strict security settings
    const cookieOptions = {
        httpOnly: true,
        secure: true, // Requires HTTPS (Vercel provides this)
        sameSite: 'strict' as const,
        path: '/',
        maxAge: expires_in,
    };

    // Refresh token usually lives longer
    const refreshCookieOptions = {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30, // 30 days
    };

    const accessTokenCookie = serialize('sb-access-token', access_token, cookieOptions);
    const refreshTokenCookie = serialize('sb-refresh-token', refresh_token, refreshCookieOptions);

    const headers = new Headers();
    headers.append('Set-Cookie', accessTokenCookie);
    headers.append('Set-Cookie', refreshTokenCookie);
    headers.append('Content-Type', 'application/json');

    // Return user info but NOT the tokens in the body
    return new Response(JSON.stringify({ user: data.user }), {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
