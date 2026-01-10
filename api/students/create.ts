import { serialize } from 'cookie';
import { withSentry } from '../_lib/sentry';

export const config = {
  runtime: 'edge',
};

async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // 1. Verify Authentication & Authorization
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Needed for admin actions if we want to bypass RLS or create users without auto-login

  // NOTE: For this implementation, we'll try to use the client-side session or just a passed token.
  // However, in Edge Functions, 'request' doesn't automatically have the user.
  // We should ideally check the Authorization header.
  
  // Checking payload
  const { name, email, password, user_metadata } = await request.json();

  // If name is not provided directly, try to get it from metadata (frontend sends it in user_metadata)
  const studentName = name || user_metadata?.full_name || user_metadata?.first_name;

  if (!email || !password || !studentName) {
      return new Response(JSON.stringify({ error: 'Missing Required Fields' }), { status: 400 });
  }

  if (!supabaseUrl || !supabaseKey) {
    return new Response('Server configuration error', { status: 500 });
  }

  // To create a user *without* logging them in (as an admin creates a student),
  // we usually need the Service Role Key or use the admin API.
  // Since we might not have the Service Key in the env (usually VITE_ only for frontend),
  // we will try to use the standard signup but this usually logs the user in or requires email confirmation.
  
  // ALTERNATIVE: Use the API route to just "sign up" which creates the user in Auth.
  // But we want to set the role immediately.
  
  // If we don't have a service role key, we can't easily assign roles during signup without a Trigger (which we have: handle_new_user).
  // The trigger defaults to 'student', which is what we want!
  
  const signupUrl = `${supabaseUrl}/auth/v1/signup`;
  
  // Use metadata from frontend if available, otherwise construct it
  const metadata = user_metadata || { name: studentName };

  const signupResponse = await fetch(signupUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
    body: JSON.stringify({ 
        email, 
        password, 
        data: metadata // Pass the full metadata
    }),
  });

  const data = await signupResponse.json();

  if (!signupResponse.ok) {
    return new Response(JSON.stringify(data), { 
      status: signupResponse.status, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Success
  return new Response(JSON.stringify({ message: 'Student created successfully', user: data.user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default withSentry(handler);
