import { serialize } from 'cookie';
import { withSentry } from './_lib/sentry';

export const config = {
  runtime: 'edge',
};

async function handler(request: Request) {
  const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      path: '/',
      maxAge: -1, 
  };

  const accessTokenCookie = serialize('sb-access-token', '', cookieOptions);
  const refreshTokenCookie = serialize('sb-refresh-token', '', cookieOptions);

  const headers = new Headers();
  headers.append('Set-Cookie', accessTokenCookie);
  headers.append('Set-Cookie', refreshTokenCookie);
  headers.append('Location', '/'); // Optional redirect

  if (request.method === 'POST' || request.method === 'GET') {
      return new Response(JSON.stringify({ message: 'Logged out' }), {
          status: 200,
          headers: headers,
      });
  }
  
  return new Response('Method not allowed', { status: 405 });
}

export default withSentry(handler);
