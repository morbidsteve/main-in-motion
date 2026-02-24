// Main In Motion — Configuration
// Replace these with your Supabase project credentials
export const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

export const MAP_CONFIG = {
  center: [39.6128, -86.3751],
  defaultZoom: 17,
  minZoom: 14,
  maxZoom: 19,
  // OpenStreetMap Transport Map (via Thunderforest-style, no key required for OPNVKarte)
  tileUrl: 'https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png',
  tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map: <a href="https://memomaps.de/">memomaps.de</a> (Transport)',
  // Fallback standard OSM tiles
  fallbackTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  fallbackAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

export const COLORS = {
  primary: '#1B3A5C',
  accent: '#E87722',
  parking: '#2563EB',
  businessOpen: '#16A34A',
  businessLimited: '#F59E0B',
  businessClosed: '#DC2626',
  constructionZone: '#DC2626',
  constructionZoneFill: 'rgba(220,38,38,0.15)',
  detourRoute: '#F59E0B',
  roadClosure: '#DC2626',
  localTraffic: '#9CA3AF',
  text: '#1F2937'
};

export const FEATURE_STYLES = {
  construction_zone: {
    color: '#DC2626',
    fillColor: 'rgba(220,38,38,0.15)',
    weight: 2,
    dashArray: '8,4',
    fillOpacity: 0.15
  },
  road_closure: {
    color: '#DC2626',
    weight: 5,
    dashArray: '12,8',
    opacity: 0.8
  },
  detour_route: {
    color: '#F59E0B',
    weight: 4,
    opacity: 0.9
  },
  local_traffic_only: {
    color: '#9CA3AF',
    weight: 3,
    dashArray: '6,6',
    opacity: 0.7
  }
};
