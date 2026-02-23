// Main In Motion — Geolocation (GPS Blue Dot)
import { getMap } from './map.js';

let watchId = null;
let userMarker = null;
let accuracyCircle = null;
let userPosition = null;

export function getUserPosition() {
  return userPosition;
}

export function initGeolocation() {
  const gpsBtn = document.getElementById('gps-btn');
  if (!gpsBtn) return;

  gpsBtn.addEventListener('click', () => {
    if (userPosition) {
      centerOnUser();
    } else {
      requestLocation();
    }
  });

  // Try to get location on load (without prompting if permission already granted)
  if (navigator.permissions) {
    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'granted') {
        startWatching();
      }
      // If 'prompt', we wait for user to click the GPS button
    }).catch(() => {
      // permissions API not supported, just try silently
    });
  }
}

function requestLocation() {
  if (!('geolocation' in navigator)) {
    console.warn('Geolocation not supported');
    return;
  }
  startWatching();
}

function startWatching() {
  if (watchId !== null) return;

  watchId = navigator.geolocation.watchPosition(
    onPositionUpdate,
    onPositionError,
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000
    }
  );
}

function onPositionUpdate(position) {
  const { latitude, longitude, accuracy } = position.coords;
  userPosition = { lat: latitude, lng: longitude, accuracy };

  const map = getMap();
  if (!map) return;

  // Create or update the blue dot
  if (!userMarker) {
    const dotIcon = L.divIcon({
      className: 'gps-dot-wrapper',
      html: '<div class="gps-dot"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    userMarker = L.marker([latitude, longitude], {
      icon: dotIcon,
      zIndexOffset: 1000,
      interactive: false
    }).addTo(map);

    accuracyCircle = L.circle([latitude, longitude], {
      radius: accuracy,
      className: 'gps-accuracy',
      interactive: false,
      weight: 1
    }).addTo(map);

    // Center on user first time
    centerOnUser();
  } else {
    userMarker.setLatLng([latitude, longitude]);
    accuracyCircle.setLatLng([latitude, longitude]);
    accuracyCircle.setRadius(accuracy);
  }
}

function onPositionError(error) {
  console.warn('Geolocation error:', error.message);
}

export function centerOnUser() {
  if (!userPosition) return;
  const map = getMap();
  if (!map) return;
  map.setView([userPosition.lat, userPosition.lng], 18, { animate: true });
}

export function stopWatching() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}
