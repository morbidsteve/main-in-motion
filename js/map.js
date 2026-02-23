// Main In Motion — Map Setup
import { MAP_CONFIG } from './config.js';

let map = null;

export function initMap() {
  map = L.map('map', {
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.defaultZoom,
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom,
    zoomControl: true,
    attributionControl: true
  });

  L.tileLayer(MAP_CONFIG.tileUrl, {
    attribution: MAP_CONFIG.tileAttribution,
    maxZoom: MAP_CONFIG.maxZoom
  }).addTo(map);

  // Adjust map for desktop sidebar
  if (window.innerWidth >= 1024) {
    map.setView(MAP_CONFIG.center, MAP_CONFIG.defaultZoom);
    // Offset center to account for sidebar
    setTimeout(() => {
      const sidebarWidth = 384; // w-96 = 24rem = 384px
      const point = map.latLngToContainerPoint(MAP_CONFIG.center);
      point.x -= sidebarWidth / 2;
      const newCenter = map.containerPointToLatLng(point);
      map.setView(newCenter, MAP_CONFIG.defaultZoom, { animate: false });
    }, 100);
  }

  // Handle resize
  window.addEventListener('resize', () => { map.invalidateSize(); });

  return map;
}

export function getMap() {
  return map;
}

export function centerMap(lat, lng, zoom) {
  if (!map) return;
  map.setView([lat, lng], zoom || map.getZoom(), { animate: true });
}

export function fitBounds(bounds, options) {
  if (!map) return;
  map.fitBounds(bounds, options);
}
