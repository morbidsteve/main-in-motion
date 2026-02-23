// Main In Motion — Walking Directions
import { getMap } from './map.js';
import { getUserPosition } from './geolocation.js';

let routingControl = null;

export function showDirections(fromLat, fromLng, toLat, toLng) {
  clearDirections();

  const map = getMap();
  if (!map) return;

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(fromLat, fromLng),
      L.latLng(toLat, toLng)
    ],
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1',
      profile: 'foot'
    }),
    lineOptions: {
      styles: [
        { color: '#1B3A5C', opacity: 0.8, weight: 5 },
        { color: '#3B82F6', opacity: 0.5, weight: 8 }
      ],
      addWaypoints: false
    },
    show: false, // We handle instructions ourselves
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    createMarker: (i, wp, nWps) => {
      if (i === 0) {
        return L.marker(wp.latLng, {
          icon: L.divIcon({
            className: 'route-start-marker',
            html: '<div style="width:14px;height:14px;background:#1B3A5C;border:3px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          })
        });
      }
      if (i === nWps - 1) {
        return L.marker(wp.latLng, {
          icon: L.divIcon({
            className: 'route-end-marker',
            html: '<div style="width:14px;height:14px;background:#E87722;border:3px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          })
        });
      }
      return null;
    }
  }).addTo(map);

  // Show routing panel
  routingControl.on('routesfound', (e) => {
    const route = e.routes[0];
    const panel = document.getElementById('routing-panel');
    const instructions = document.getElementById('routing-instructions');
    if (!panel || !instructions) return;

    const distMi = (route.summary.totalDistance / 1609.34).toFixed(2);
    const timeMin = Math.ceil(route.summary.totalTime / 60);

    let html = `<div class="mb-3"><span class="font-semibold text-navy">${distMi} mi</span> <span class="text-gray-400">·</span> <span class="text-gray-600">${timeMin} min walk</span></div>`;
    html += '<ol class="space-y-2 list-decimal list-inside text-gray-600">';
    route.instructions.forEach(inst => {
      if (inst.text) {
        html += `<li class="text-sm">${inst.text}</li>`;
      }
    });
    html += '</ol>';
    instructions.innerHTML = html;
    panel.classList.remove('hidden');
  });
}

export function showDirectionsFromUser(toLat, toLng) {
  const pos = getUserPosition();
  if (!pos) {
    alert('Location not available. Please enable GPS and try again.');
    return;
  }
  showDirections(pos.lat, pos.lng, toLat, toLng);
}

export function showWalkFromParking(parkingLat, parkingLng) {
  // Walk from parking to nearest Main St point
  const mainStLat = 39.6128;
  // Find nearest point on Main St (same lng as parking, clamped to Main St lat)
  showDirections(parkingLat, parkingLng, mainStLat, parkingLng);
}

export function clearDirections() {
  const map = getMap();
  if (routingControl && map) {
    map.removeControl(routingControl);
    routingControl = null;
  }
  const panel = document.getElementById('routing-panel');
  if (panel) panel.classList.add('hidden');
}

// Close button
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('routing-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', clearDirections);
  }
});
