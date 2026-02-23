// Main In Motion — Business Markers Layer
import { getMap } from '../map.js';
import { statusBadge, categoryIcon, escapeHtml, getMapsUrl } from '../utils.js';
import { highlightParking } from './parking.js';

let businessLayer = null;
let businessData = [];

export function getBusinessData() {
  return businessData;
}

export function initBusinessLayer(data) {
  businessData = data;
  const map = getMap();
  if (!map) return;

  if (businessLayer) {
    map.removeLayer(businessLayer);
  }

  businessLayer = L.layerGroup();

  data.forEach(biz => {
    if (!biz.lat || !biz.lng) return;

    const icon = L.divIcon({
      className: 'business-marker-wrapper',
      html: `<div class="business-marker status-${biz.status || 'open'}"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -12]
    });

    const marker = L.marker([biz.lat, biz.lng], { icon, zIndexOffset: -100 })
      .bindPopup(() => createBusinessPopup(biz), { maxWidth: 280, minWidth: 220 });

    marker.bizId = biz.id;
    businessLayer.addLayer(marker);
  });

  businessLayer.addTo(map);
  return businessLayer;
}

function createBusinessPopup(biz) {
  let html = `
    <h3>${categoryIcon(biz.category)} ${escapeHtml(biz.name)}</h3>
    <div class="popup-meta">${escapeHtml(biz.address || '')} ${biz.category ? `· ${biz.category}` : ''}</div>
    <div class="popup-status">${statusBadge(biz.status || 'open')}</div>
  `;

  if (biz.access_note) {
    html += `<div class="popup-note">📋 ${escapeHtml(biz.access_note)}</div>`;
  }

  html += '<div class="popup-actions">';

  if (biz.phone) {
    html += `<a href="tel:${biz.phone}" class="popup-btn popup-btn-outline">📞 ${escapeHtml(biz.phone)}</a>`;
  }

  if (biz.website) {
    html += `<a href="${biz.website}" target="_blank" rel="noopener" class="popup-btn popup-btn-outline">🌐 Website</a>`;
  }

  if (biz.nearest_parking_id) {
    html += `<button class="popup-btn popup-btn-primary" onclick="window._showNearestParking('${biz.nearest_parking_id}')">🅿️ Get Parking</button>`;
  }

  html += '</div>';
  return html;
}

// Global handler for popup button
window._showNearestParking = function(parkingId) {
  highlightParking(parkingId);
};

export function showBusinessLayer() {
  const map = getMap();
  if (businessLayer && map && !map.hasLayer(businessLayer)) {
    map.addLayer(businessLayer);
  }
}

export function hideBusinessLayer() {
  const map = getMap();
  if (businessLayer && map && map.hasLayer(businessLayer)) {
    map.removeLayer(businessLayer);
  }
}

export function highlightBusiness(bizId) {
  if (!businessLayer) return;
  businessLayer.eachLayer(marker => {
    if (marker.bizId === bizId) {
      marker.openPopup();
      const map = getMap();
      if (map) map.setView(marker.getLatLng(), 18, { animate: true });
    }
  });
}
