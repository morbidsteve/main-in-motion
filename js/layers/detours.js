// Main In Motion — Detour Routes Layer
import { getMap } from '../map.js';
import { FEATURE_STYLES } from '../config.js';
import { parseCoords } from './construction.js';

let detourLayer = null;

export function initDetourLayer(features) {
  const map = getMap();
  if (!map) return;

  if (detourLayer) {
    map.removeLayer(detourLayer);
  }

  detourLayer = L.layerGroup();

  features.forEach(feature => {
    if (feature.feature_type !== 'detour_route' && feature.feature_type !== 'local_traffic_only') return;
    if (feature.geometry_type !== 'LineString') return;

    const coords = parseCoords(feature.geometry_coords, 'LineString');
    if (!coords || coords.length < 2) return;

    if (feature.feature_type === 'detour_route') {
      const style = { ...FEATURE_STYLES.detour_route };
      if (feature.style_color) style.color = feature.style_color;

      const polyline = L.polyline(coords, style);

      // Add directional arrows using PolylineDecorator
      if (typeof L.polylineDecorator === 'function') {
        const decorator = L.polylineDecorator(polyline, {
          patterns: [
            {
              offset: 25,
              repeat: 60,
              symbol: L.Symbol.arrowHead({
                pixelSize: 12,
                polygon: false,
                pathOptions: {
                  color: feature.style_color || '#F59E0B',
                  weight: 3,
                  opacity: 0.9
                }
              })
            }
          ]
        });
        detourLayer.addLayer(decorator);
      }

      if (feature.name || feature.description) {
        polyline.bindPopup(`
          <h3 style="color:#F59E0B;">↩️ ${feature.name || 'Detour'}</h3>
          ${feature.description ? `<p style="font-size:13px;color:#4B5563;margin-top:4px;">${feature.description}</p>` : ''}
          ${feature.direction ? `<p style="font-size:12px;color:#6B7280;margin-top:2px;">Direction: ${feature.direction}</p>` : ''}
        `, { maxWidth: 260 });
      }
      detourLayer.addLayer(polyline);

    } else if (feature.feature_type === 'local_traffic_only') {
      const style = { ...FEATURE_STYLES.local_traffic_only };
      if (feature.style_color) style.color = feature.style_color;

      const polyline = L.polyline(coords, style);
      if (feature.name) {
        polyline.bindPopup(`<h3 style="color:#9CA3AF;">🚗 ${feature.name}</h3><p style="font-size:13px;">Local traffic only</p>`);
      }
      detourLayer.addLayer(polyline);
    }
  });

  detourLayer.addTo(map);
  return detourLayer;
}

export function showDetourLayer() {
  const map = getMap();
  if (detourLayer && map && !map.hasLayer(detourLayer)) {
    map.addLayer(detourLayer);
  }
}

export function hideDetourLayer() {
  const map = getMap();
  if (detourLayer && map && map.hasLayer(detourLayer)) {
    map.removeLayer(detourLayer);
  }
}
