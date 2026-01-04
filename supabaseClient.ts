import { createClient } from '@supabase/supabase-js'

// Use our local proxy instead of direct Supabase URL
// In production/Vercel, we use relative path
const proxyUrl = typeof window !== 'undefined' ? window.location.origin + '/api/proxy' : process.env.VITE_SUPABASE_URL || ''

// We still need a placeholder key for the client initialization, 
// but the proxy will manage the actual keys.
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(proxyUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't store tokens in localStorage
    autoRefreshToken: false, // Proxy handles this with Cookies
    detectSessionInUrl: false
  }
})
