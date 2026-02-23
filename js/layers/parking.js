// Main In Motion — Parking Layer
import { getMap } from '../map.js';
import { showDirectionsFromUser, showWalkFromParking } from '../directions.js';
import { getMapsUrl, escapeHtml } from '../utils.js';

let parkingLayer = null;
let parkingData = [];

export function getParkingData() {
  return parkingData;
}

export function initParkingLayer(data) {
  parkingData = data;
  const map = getMap();
  if (!map) return;

  if (parkingLayer) {
    map.removeLayer(parkingLayer);
  }

  parkingLayer = L.layerGroup();

  data.forEach(lot => {
    if (!lot.lat || !lot.lng) return;

    const icon = L.divIcon({
      className: 'parking-marker-wrapper',
      html: '<div class="parking-marker">P</div>',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22]
    });

    const marker = L.marker([lot.lat, lot.lng], { icon }).bindPopup(() => createParkingPopup(lot), {
      maxWidth: 280,
      minWidth: 220
    });

    marker.lotId = lot.id;
    parkingLayer.addLayer(marker);
  });

  parkingLayer.addTo(map);
  return parkingLayer;
}

function createParkingPopup(lot) {
  const mapsUrl = getMapsUrl(lot.lat, lot.lng);
  const accessibleIcon = lot.accessible ? '<span title="Accessible">♿</span>' : '';

  let html = `
    <h3>${escapeHtml(lot.name)}</h3>
    <div class="popup-meta">
      ${lot.address ? escapeHtml(lot.address) : ''}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
      ${lot.capacity ? `<span style="font-size:12px;color:#4B5563;">📊 ${escapeHtml(lot.capacity)}</span>` : ''}
      ${lot.hours ? `<span style="font-size:12px;color:#4B5563;">🕐 ${escapeHtml(lot.hours)}</span>` : ''}
      ${accessibleIcon ? `<span style="font-size:12px;">${accessibleIcon} Accessible</span>` : ''}
    </div>
  `;

  if (lot.notes) {
    html += `<div class="popup-note">${escapeHtml(lot.notes)}</div>`;
  }

  html += `
    <div class="popup-actions">
      <button class="popup-btn popup-btn-primary" onclick="window._parkingDirections('${lot.id}')">
        📍 Directions Here
      </button>
      <button class="popup-btn popup-btn-accent" onclick="window._walkFromParking(${lot.lat}, ${lot.lng})">
        🚶 Walk to Main St
      </button>
      <a href="${mapsUrl}" target="_blank" rel="noopener" class="popup-btn popup-btn-outline">
        🗺️ Open in Maps
      </a>
    </div>
  `;

  return html;
}

// Global handlers for popup buttons
window._parkingDirections = function(lotId) {
  const lot = parkingData.find(l => l.id === lotId);
  if (lot) showDirectionsFromUser(lot.lat, lot.lng);
};

window._walkFromParking = function(lat, lng) {
  showWalkFromParking(lat, lng);
};

export function showParkingLayer() {
  const map = getMap();
  if (parkingLayer && map && !map.hasLayer(parkingLayer)) {
    map.addLayer(parkingLayer);
  }
}

export function hideParkingLayer() {
  const map = getMap();
  if (parkingLayer && map && map.hasLayer(parkingLayer)) {
    map.removeLayer(parkingLayer);
  }
}

export function highlightParking(lotId) {
  if (!parkingLayer) return;
  parkingLayer.eachLayer(marker => {
    if (marker.lotId === lotId) {
      marker.openPopup();
      const map = getMap();
      if (map) map.setView(marker.getLatLng(), 18, { animate: true });
    }
  });
}
