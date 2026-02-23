// Main In Motion — Admin Auth
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let supabase = null;

export function getAdminSupabase() {
  if (!supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

export async function signIn(email, password) {
  const sb = getAdminSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const sb = getAdminSupabase();
  await sb.auth.signOut();
}

export async function getSession() {
  const sb = getAdminSupabase();
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

export function onAuthStateChange(callback) {
  const sb = getAdminSupabase();
  return sb.auth.onAuthStateChange(callback);
}
