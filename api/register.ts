import { serialize } from 'cookie';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email, password, options } = await request.json();
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response('Server configuration error', { status: 500 });
    }

    const signupUrl = `${supabaseUrl}/auth/v1/signup`;
    
    const signupResponse = await fetch(signupUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({ email, password, data: options?.data }),
    });

    const data = await signupResponse.json();

    if (!signupResponse.ok) {
      return new Response(JSON.stringify(data), { 
        status: signupResponse.status, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If signup is successful and returns a session (auto-login enabled)
    if (data.access_token && data.refresh_token) {
        const { access_token, refresh_token, expires_in } = data;
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'strict' as const,
            path: '/',
            maxAge: expires_in,
        };
        const refreshCookieOptions = {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 30, // 30 days
        };

        const headers = new Headers();
        headers.append('Set-Cookie', serialize('sb-access-token', access_token, cookieOptions));
        headers.append('Set-Cookie', serialize('sb-refresh-token', refresh_token, refreshCookieOptions));
        headers.append('Content-Type', 'application/json');

        return new Response(JSON.stringify({ user: data.user }), {
          status: 200,
          headers: headers,
        });
    }

    // Otherwise just return the user info
    return new Response(JSON.stringify({ user: data.user, message: 'Check your email' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
