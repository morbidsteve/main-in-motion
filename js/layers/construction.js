// Main In Motion — Construction Layer
import { getMap } from '../map.js';
import { FEATURE_STYLES } from '../config.js';

let constructionLayer = null;

export function initConstructionLayer(features) {
  const map = getMap();
  if (!map) return;

  if (constructionLayer) {
    map.removeLayer(constructionLayer);
  }

  constructionLayer = L.layerGroup();

  features.forEach(feature => {
    if (feature.feature_type !== 'construction_zone' && feature.feature_type !== 'road_closure') return;

    const coords = parseCoords(feature.geometry_coords, feature.geometry_type);
    if (!coords) return;

    let layer;
    if (feature.geometry_type === 'Polygon') {
      const style = { ...FEATURE_STYLES.construction_zone };
      if (feature.style_color) {
        style.color = feature.style_color;
        style.fillColor = feature.style_color + '26'; // ~15% opacity hex
      }
      layer = L.polygon(coords, style);
    } else if (feature.geometry_type === 'LineString') {
      const style = { ...FEATURE_STYLES.road_closure };
      if (feature.style_color) style.color = feature.style_color;
      layer = L.polyline(coords, style);
    }

    if (layer) {
      if (feature.name || feature.description) {
        layer.bindPopup(`
          <h3 style="color:#DC2626;">${feature.name || 'Construction'}</h3>
          ${feature.description ? `<p style="font-size:13px;color:#4B5563;margin-top:4px;">${feature.description}</p>` : ''}
        `, { maxWidth: 260 });
      }
      constructionLayer.addLayer(layer);
    }
  });

  // Also render barriers
  features.forEach(feature => {
    if (feature.feature_type !== 'partial_barrier' && feature.feature_type !== 'road_block') return;

    const coords = parseCoords(feature.geometry_coords, feature.geometry_type);
    if (!coords) return;

    const emoji = feature.feature_type === 'road_block' ? '⛔' : '🚧';
    const icon = L.divIcon({
      className: 'barrier-marker',
      html: `<span>${emoji}</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker(coords, { icon });
    if (feature.name) {
      marker.bindPopup(`<h3>${feature.name}</h3>${feature.description ? `<p style="font-size:13px;color:#4B5563;">${feature.description}</p>` : ''}`);
    }
    constructionLayer.addLayer(marker);
  });

  constructionLayer.addTo(map);
  return constructionLayer;
}

function parseCoords(coordsJson, geometryType) {
  try {
    const raw = typeof coordsJson === 'string' ? JSON.parse(coordsJson) : coordsJson;

    if (geometryType === 'Point') {
      // [lat, lng]
      return [raw[0], raw[1]];
    }

    if (geometryType === 'LineString') {
      // [[lat, lng], [lat, lng], ...]
      return raw.map(c => [c[0], c[1]]);
    }

    if (geometryType === 'Polygon') {
      // [[lat, lng], [lat, lng], ...] — Leaflet polygon accepts array of LatLngs
      return raw.map(c => [c[0], c[1]]);
    }

    return null;
  } catch (e) {
    console.error('Error parsing coordinates:', e);
    return null;
  }
}

export { parseCoords };

export function showConstructionLayer() {
  const map = getMap();
  if (constructionLayer && map && !map.hasLayer(constructionLayer)) {
    map.addLayer(constructionLayer);
  }
}

export function hideConstructionLayer() {
  const map = getMap();
  if (constructionLayer && map && map.hasLayer(constructionLayer)) {
    map.removeLayer(constructionLayer);
  }
}
