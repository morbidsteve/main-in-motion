// Main In Motion — Supabase Client
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

let supabaseInstance = null;

export function getSupabase() {
  if (!supabaseInstance) {
    if (typeof window.supabase === 'undefined') {
      console.error('Supabase JS library not loaded');
      return null;
    }
    supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseInstance;
}

// Data fetching helpers
export async function fetchParkingLots() {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from('parking_lots').select('*').eq('is_active', true);
  if (error) { console.error('Error fetching parking lots:', error); return []; }
  return data || [];
}

export async function fetchBusinesses() {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from('businesses').select('*').eq('is_active', true);
  if (error) { console.error('Error fetching businesses:', error); return []; }
  return data || [];
}

export async function fetchConstructionPhases() {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from('construction_phases').select('*').order('sort_order');
  if (error) { console.error('Error fetching phases:', error); return []; }
  return data || [];
}

export async function fetchMapFeatures(activeOnly = true) {
  const sb = getSupabase();
  if (!sb) return [];
  let query = sb.from('map_features').select('*');
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) { console.error('Error fetching map features:', error); return []; }
  return data || [];
}

export async function fetchAppSettings() {
  const sb = getSupabase();
  if (!sb) return {};
  const { data, error } = await sb.from('app_settings').select('*');
  if (error) { console.error('Error fetching settings:', error); return {}; }
  const settings = {};
  (data || []).forEach(row => { settings[row.key] = row.value; });
  return settings;
}

// Subscribe to realtime changes
export function subscribeToChanges(table, callback) {
  const sb = getSupabase();
  if (!sb) return null;
  return sb.channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
}
