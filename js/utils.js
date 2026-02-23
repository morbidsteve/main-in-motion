// Main In Motion — Utility Functions

export function distanceBetween(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return deg * Math.PI / 180; }

export function formatDistance(miles) {
  if (miles < 0.1) return Math.round(miles * 5280) + ' ft';
  return miles.toFixed(2) + ' mi';
}

export function detectPlatform() {
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  return 'other';
}

export function getMapsUrl(lat, lng) {
  if (detectPlatform() === 'ios') {
    return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

export function statusBadge(status) {
  const colors = { open: 'bg-green-500', limited: 'bg-amber-500', closed: 'bg-red-500' };
  const labels = { open: 'Open', limited: 'Limited Access', closed: 'Temporarily Closed' };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${colors[status] || colors.open}">${labels[status] || status}</span>`;
}

export function categoryIcon(category) {
  const icons = { Dining: '🍽️', Retail: '🛍️', Services: '💼' };
  return icons[category] || '📍';
}

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
