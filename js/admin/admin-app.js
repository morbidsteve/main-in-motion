// Main In Motion — Admin App Entry Point
import { signIn, signOut, getSession, onAuthStateChange, getAdminSupabase } from './auth.js';
import { MAP_CONFIG } from '../config.js';

let adminMap = null;
let drawnItems = null;
let currentEditItem = null;
let allPhases = [];
let allParkingLots = [];
let allBusinesses = [];
let allFeatures = [];

// ============================================
// INITIALIZATION
// ============================================
async function init() {
  // Check for existing session
  const session = await getSession();
  if (session) {
    showDashboard(session);
  }

  // Auth state listener
  onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      showDashboard(session);
    } else if (event === 'SIGNED_OUT') {
      showLogin();
    }
  });

  // Login form
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

  // Admin tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Modal close handlers
  document.getElementById('admin-modal-backdrop')?.addEventListener('click', closeModal);
  document.getElementById('admin-modal-close')?.addEventListener('click', closeModal);
  document.getElementById('admin-modal-cancel')?.addEventListener('click', closeModal);
  document.getElementById('confirm-cancel')?.addEventListener('click', closeConfirm);
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  try {
    errorEl.classList.add('hidden');
    await signIn(email, password);
  } catch (err) {
    errorEl.textContent = err.message || 'Login failed';
    errorEl.classList.remove('hidden');
  }
}

async function handleLogout() {
  await signOut();
  showLogin();
}

function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('admin-dashboard').classList.add('hidden');
}

async function showDashboard(session) {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('admin-dashboard').classList.remove('hidden');

  const emailEl = document.getElementById('admin-email');
  if (emailEl && session?.user?.email) {
    emailEl.textContent = session.user.email;
  }

  // Initialize admin map
  initAdminMap();

  // Load all data
  await loadAllData();
}

// ============================================
// TAB SWITCHING
// ============================================
function switchTab(tabName) {
  document.querySelectorAll('.admin-tab').forEach(t => {
    t.classList.remove('active');
    t.classList.add('border-transparent', 'text-white/60');
    t.classList.remove('border-accent');
  });
  const activeTab = document.querySelector(`.admin-tab[data-tab="${tabName}"]`);
  if (activeTab) {
    activeTab.classList.add('active', 'border-accent');
    activeTab.classList.remove('border-transparent', 'text-white/60');
  }

  document.querySelectorAll('.admin-panel').forEach(p => p.classList.add('hidden'));
  const panel = document.getElementById(`panel-${tabName}`);
  if (panel) panel.classList.remove('hidden');

  // Resize map when switching to map editor
  if (tabName === 'map-editor' && adminMap) {
    setTimeout(() => adminMap.invalidateSize(), 100);
  }
}

// ============================================
// ADMIN MAP
// ============================================
function initAdminMap() {
  if (adminMap) return;

  adminMap = L.map('admin-map', {
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.defaultZoom,
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom
  });

  L.tileLayer(MAP_CONFIG.tileUrl, {
    attribution: MAP_CONFIG.tileAttribution,
    maxZoom: MAP_CONFIG.maxZoom
  }).addTo(adminMap);

  // Initialize draw layer
  drawnItems = new L.FeatureGroup();
  adminMap.addLayer(drawnItems);

  // Leaflet.draw controls
  const drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
      polygon: { shapeOptions: { color: '#DC2626', fillOpacity: 0.15 } },
      polyline: { shapeOptions: { color: '#F59E0B' } },
      marker: true,
      circle: false,
      circlemarker: false,
      rectangle: false
    },
    edit: {
      featureGroup: drawnItems,
      remove: true
    }
  });
  adminMap.addControl(drawControl);

  // Handle drawn items
  adminMap.on(L.Draw.Event.CREATED, (e) => {
    const layer = e.layer;
    drawnItems.addLayer(layer);
    showFeatureForm(layer, e.layerType);
  });

  // Custom buttons
  setupMapEditorButtons();
}

function setupMapEditorButtons() {
  // Add Parking Lot button
  document.getElementById('btn-add-parking')?.addEventListener('click', () => {
    showToast('Click on the map to place a parking lot', 'bg-blue-600');
    adminMap.once('click', (e) => {
      showParkingForm(null, e.latlng.lat, e.latlng.lng);
    });
  });

  // Add Business button
  document.getElementById('btn-add-business')?.addEventListener('click', () => {
    showToast('Click on the map to place a business', 'bg-green-600');
    adminMap.once('click', (e) => {
      showBusinessForm(null, e.latlng.lat, e.latlng.lng);
    });
  });

  // Add Barrier button
  document.getElementById('btn-add-barrier')?.addEventListener('click', () => {
    showToast('Click on the map to place a barrier', 'bg-red-600');
    adminMap.once('click', (e) => {
      showBarrierForm(e.latlng.lat, e.latlng.lng);
    });
  });

  // Import GeoJSON
  document.getElementById('btn-import-geojson')?.addEventListener('click', () => {
    document.getElementById('geojson-file-input')?.click();
  });

  document.getElementById('geojson-file-input')?.addEventListener('change', handleGeoJSONImport);

  // Edit form buttons
  document.getElementById('edit-form-save')?.addEventListener('click', saveEditForm);
  document.getElementById('edit-form-cancel')?.addEventListener('click', () => {
    document.getElementById('edit-form-panel')?.classList.add('hidden');
    currentEditItem = null;
  });
  document.getElementById('edit-form-delete')?.addEventListener('click', deleteEditItem);
}

// ============================================
// DATA LOADING
// ============================================
async function loadAllData() {
  const sb = getAdminSupabase();

  const [phasesRes, parkingRes, bizRes, featuresRes] = await Promise.all([
    sb.from('construction_phases').select('*').order('sort_order'),
    sb.from('parking_lots').select('*').order('name'),
    sb.from('businesses').select('*').order('name'),
    sb.from('map_features').select('*')
  ]);

  allPhases = phasesRes.data || [];
  allParkingLots = parkingRes.data || [];
  allBusinesses = bizRes.data || [];
  allFeatures = featuresRes.data || [];

  renderParkingTable();
  renderBusinessTable();
  renderPhasesList();
  renderFeaturesTable();
  renderAdminMapFeatures();
  loadSettings();

  // Settings buttons
  document.getElementById('save-announcement')?.addEventListener('click', saveAnnouncement);
  document.getElementById('save-contact')?.addEventListener('click', saveContact);

  // Bulk status
  document.getElementById('bulk-status-select')?.addEventListener('change', handleBulkStatus);

  // Business filters
  document.querySelectorAll('.admin-biz-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-biz-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderBusinessTable();
    });
  });

  // New item buttons
  document.getElementById('btn-new-parking')?.addEventListener('click', () => showParkingForm());
  document.getElementById('btn-new-business')?.addEventListener('click', () => showBusinessForm());
  document.getElementById('btn-new-phase')?.addEventListener('click', () => showPhaseForm());
}

function renderAdminMapFeatures() {
  if (!adminMap || !drawnItems) return;
  drawnItems.clearLayers();

  // Add parking markers
  allParkingLots.forEach(lot => {
    if (!lot.lat || !lot.lng) return;
    const marker = L.marker([lot.lat, lot.lng], {
      icon: L.divIcon({
        className: 'parking-marker-wrapper',
        html: '<div style="width:32px;height:32px;background:#2563EB;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:14px;box-shadow:0 1px 4px rgba(0,0,0,0.3)">P</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      }),
      draggable: true
    });
    marker._itemType = 'parking';
    marker._itemData = lot;
    marker.on('click', () => showParkingForm(lot));
    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      await updateRecord('parking_lots', lot.id, { lat: pos.lat, lng: pos.lng });
      lot.lat = pos.lat;
      lot.lng = pos.lng;
      showToast('Parking lot moved', 'bg-green-600');
    });
    marker.bindTooltip(lot.name, { direction: 'top', offset: [0, -16] });
    drawnItems.addLayer(marker);
  });

  // Add business markers
  allBusinesses.forEach(biz => {
    if (!biz.lat || !biz.lng) return;
    const color = biz.status === 'closed' ? '#DC2626' : biz.status === 'limited' ? '#F59E0B' : '#16A34A';
    const marker = L.marker([biz.lat, biz.lng], {
      icon: L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      }),
      draggable: true
    });
    marker._itemType = 'business';
    marker._itemData = biz;
    marker.on('click', () => showBusinessForm(biz));
    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      await updateRecord('businesses', biz.id, { lat: pos.lat, lng: pos.lng });
      biz.lat = pos.lat;
      biz.lng = pos.lng;
      showToast('Business moved', 'bg-green-600');
    });
    marker.bindTooltip(biz.name, { direction: 'top', offset: [0, -8] });
    drawnItems.addLayer(marker);
  });

  // Add map features
  allFeatures.forEach(feature => {
    try {
      const coords = typeof feature.geometry_coords === 'string' ? JSON.parse(feature.geometry_coords) : feature.geometry_coords;
      let layer;

      if (feature.geometry_type === 'Polygon') {
        layer = L.polygon(coords.map(c => [c[0], c[1]]), {
          color: feature.style_color || '#DC2626',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '8,4'
        });
      } else if (feature.geometry_type === 'LineString') {
        const isDetour = feature.feature_type === 'detour_route';
        layer = L.polyline(coords.map(c => [c[0], c[1]]), {
          color: feature.style_color || (isDetour ? '#F59E0B' : '#DC2626'),
          weight: isDetour ? 4 : 5,
          dashArray: isDetour ? null : '12,8'
        });
      } else if (feature.geometry_type === 'Point') {
        const emoji = feature.feature_type === 'road_block' ? '\u26d4' : '\ud83d\udea7';
        layer = L.marker([coords[0], coords[1]], {
          icon: L.divIcon({
            className: '',
            html: `<span style="font-size:20px">${emoji}</span>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          }),
          draggable: true
        });
        layer.on('dragend', async () => {
          const pos = layer.getLatLng();
          await updateRecord('map_features', feature.id, {
            geometry_coords: JSON.stringify([pos.lat, pos.lng])
          });
          showToast('Barrier moved', 'bg-green-600');
        });
      }

      if (layer) {
        layer._itemType = 'feature';
        layer._itemData = feature;
        layer.on('click', () => showFeatureEditForm(feature));
        layer.bindTooltip(feature.name, { sticky: true });
        drawnItems.addLayer(layer);
      }
    } catch (e) {
      console.error('Error rendering feature:', feature.name, e);
    }
  });
}

// ============================================
// PARKING CRUD
// ============================================
function renderParkingTable() {
  const tbody = document.getElementById('parking-table-body');
  if (!tbody) return;

  tbody.innerHTML = allParkingLots.map(lot => `
    <tr>
      <td class="px-4 py-3 font-medium">${esc(lot.name)}</td>
      <td class="px-4 py-3 text-gray-600">${esc(lot.address || '-')}</td>
      <td class="px-4 py-3 text-gray-600">${esc(lot.capacity || '-')}</td>
      <td class="px-4 py-3 text-gray-600">${esc(lot.type || 'public')}</td>
      <td class="px-4 py-3">
        <div class="toggle-switch ${lot.is_active ? 'active' : ''}" data-id="${lot.id}" data-table="parking_lots" data-field="is_active"></div>
      </td>
      <td class="px-4 py-3 text-right">
        <button class="table-btn edit-parking" data-id="${lot.id}">Edit</button>
        <button class="table-btn table-btn-danger delete-parking" data-id="${lot.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  // Event handlers
  tbody.querySelectorAll('.edit-parking').forEach(btn => {
    btn.addEventListener('click', () => {
      const lot = allParkingLots.find(l => l.id === btn.dataset.id);
      if (lot) showParkingForm(lot);
    });
  });

  tbody.querySelectorAll('.delete-parking').forEach(btn => {
    btn.addEventListener('click', () => confirmDelete('parking_lots', btn.dataset.id, 'parking lot'));
  });

  tbody.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('click', () => handleToggle(toggle));
  });
}

function showParkingForm(lot = null, lat = null, lng = null) {
  const title = lot ? 'Edit Parking Lot' : 'Add Parking Lot';
  const content = `
    <div class="space-y-3">
      <div class="admin-field"><label>Name *</label><input type="text" id="f-parking-name" value="${esc(lot?.name || '')}" required></div>
      <div class="admin-field"><label>Address</label><input type="text" id="f-parking-address" value="${esc(lot?.address || '')}"></div>
      <div class="grid grid-cols-2 gap-3">
        <div class="admin-field"><label>Latitude *</label><input type="number" step="any" id="f-parking-lat" value="${lot?.lat ?? lat ?? ''}" required></div>
        <div class="admin-field"><label>Longitude *</label><input type="number" step="any" id="f-parking-lng" value="${lot?.lng ?? lng ?? ''}" required></div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="admin-field"><label>Capacity</label><input type="text" id="f-parking-capacity" value="${esc(lot?.capacity || '')}"></div>
        <div class="admin-field"><label>Type</label>
          <select id="f-parking-type">
            <option value="public" ${lot?.type === 'public' ? 'selected' : ''}>Public</option>
            <option value="church" ${lot?.type === 'church' ? 'selected' : ''}>Church</option>
            <option value="business-shared" ${lot?.type === 'business-shared' ? 'selected' : ''}>Business Shared</option>
          </select>
        </div>
      </div>
      <div class="admin-field"><label>Hours</label><input type="text" id="f-parking-hours" value="${esc(lot?.hours || '24/7')}"></div>
      <div class="admin-field"><label>Notes</label><textarea id="f-parking-notes" rows="2">${esc(lot?.notes || '')}</textarea></div>
      <label class="flex items-center gap-2"><input type="checkbox" id="f-parking-accessible" ${lot?.accessible !== false ? 'checked' : ''}> <span class="text-sm">Accessible</span></label>
    </div>
  `;

  openModal(title, content, async () => {
    const data = {
      name: document.getElementById('f-parking-name').value.trim(),
      address: document.getElementById('f-parking-address').value.trim(),
      lat: parseFloat(document.getElementById('f-parking-lat').value),
      lng: parseFloat(document.getElementById('f-parking-lng').value),
      capacity: document.getElementById('f-parking-capacity').value.trim(),
      type: document.getElementById('f-parking-type').value,
      hours: document.getElementById('f-parking-hours').value.trim(),
      notes: document.getElementById('f-parking-notes').value.trim(),
      accessible: document.getElementById('f-parking-accessible').checked
    };

    if (!data.name || isNaN(data.lat) || isNaN(data.lng)) {
      showToast('Name, Lat, and Lng are required', 'bg-red-600');
      return;
    }

    if (lot) {
      await updateRecord('parking_lots', lot.id, data);
    } else {
      await insertRecord('parking_lots', data);
    }
    await reloadData();
    closeModal();
    showToast(lot ? 'Parking lot updated' : 'Parking lot added', 'bg-green-600');
  });
}

// ============================================
// BUSINESS CRUD
// ============================================
function renderBusinessTable() {
  const tbody = document.getElementById('business-table-body');
  if (!tbody) return;

  const activeFilter = document.querySelector('.admin-biz-filter.active');
  const category = activeFilter?.dataset.filter || 'all';

  let filtered = allBusinesses;
  if (category !== 'all') {
    filtered = filtered.filter(b => b.category === category);
  }

  tbody.innerHTML = filtered.map(biz => `
    <tr>
      <td class="px-4 py-3 font-medium">${esc(biz.name)}</td>
      <td class="px-4 py-3 text-gray-600 text-xs">${esc(biz.address || '-')}</td>
      <td class="px-4 py-3 text-gray-600">${esc(biz.category || '-')}</td>
      <td class="px-4 py-3">
        <select class="status-select text-xs px-2 py-1 border rounded" data-id="${biz.id}">
          <option value="open" ${biz.status === 'open' ? 'selected' : ''}>Open</option>
          <option value="limited" ${biz.status === 'limited' ? 'selected' : ''}>Limited</option>
          <option value="closed" ${biz.status === 'closed' ? 'selected' : ''}>Closed</option>
        </select>
      </td>
      <td class="px-4 py-3 text-gray-600 text-xs max-w-[200px] truncate">${esc(biz.access_note || '-')}</td>
      <td class="px-4 py-3 text-right">
        <button class="table-btn edit-biz" data-id="${biz.id}">Edit</button>
        <button class="table-btn table-btn-danger delete-biz" data-id="${biz.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  // Inline status change
  tbody.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      await updateRecord('businesses', sel.dataset.id, { status: sel.value });
      const biz = allBusinesses.find(b => b.id === sel.dataset.id);
      if (biz) biz.status = sel.value;
      showToast('Status updated', 'bg-green-600');
    });
  });

  tbody.querySelectorAll('.edit-biz').forEach(btn => {
    btn.addEventListener('click', () => {
      const biz = allBusinesses.find(b => b.id === btn.dataset.id);
      if (biz) showBusinessForm(biz);
    });
  });

  tbody.querySelectorAll('.delete-biz').forEach(btn => {
    btn.addEventListener('click', () => confirmDelete('businesses', btn.dataset.id, 'business'));
  });
}

function showBusinessForm(biz = null, lat = null, lng = null) {
  const title = biz ? 'Edit Business' : 'Add Business';
  const parkingOptions = allParkingLots.map(p =>
    `<option value="${p.id}" ${biz?.nearest_parking_id === p.id ? 'selected' : ''}>${esc(p.name)}</option>`
  ).join('');

  const content = `
    <div class="space-y-3">
      <div class="admin-field"><label>Name *</label><input type="text" id="f-biz-name" value="${esc(biz?.name || '')}" required></div>
      <div class="admin-field"><label>Address</label><input type="text" id="f-biz-address" value="${esc(biz?.address || '')}"></div>
      <div class="grid grid-cols-2 gap-3">
        <div class="admin-field"><label>Latitude *</label><input type="number" step="any" id="f-biz-lat" value="${biz?.lat ?? lat ?? ''}" required></div>
        <div class="admin-field"><label>Longitude *</label><input type="number" step="any" id="f-biz-lng" value="${biz?.lng ?? lng ?? ''}" required></div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="admin-field"><label>Category</label>
          <select id="f-biz-category">
            <option value="Dining" ${biz?.category === 'Dining' ? 'selected' : ''}>Dining</option>
            <option value="Retail" ${biz?.category === 'Retail' ? 'selected' : ''}>Retail</option>
            <option value="Services" ${biz?.category === 'Services' ? 'selected' : ''}>Services</option>
          </select>
        </div>
        <div class="admin-field"><label>Status</label>
          <select id="f-biz-status">
            <option value="open" ${biz?.status === 'open' ? 'selected' : ''}>Open</option>
            <option value="limited" ${biz?.status === 'limited' ? 'selected' : ''}>Limited</option>
            <option value="closed" ${biz?.status === 'closed' ? 'selected' : ''}>Closed</option>
          </select>
        </div>
      </div>
      <div class="admin-field"><label>Phone</label><input type="text" id="f-biz-phone" value="${esc(biz?.phone || '')}"></div>
      <div class="admin-field"><label>Website</label><input type="url" id="f-biz-website" value="${esc(biz?.website || '')}"></div>
      <div class="admin-field"><label>Hours</label><input type="text" id="f-biz-hours" value="${esc(biz?.hours || '')}"></div>
      <div class="admin-field"><label>Access Note</label><textarea id="f-biz-access-note" rows="2">${esc(biz?.access_note || '')}</textarea></div>
      <div class="admin-field"><label>Nearest Parking</label>
        <select id="f-biz-parking"><option value="">None</option>${parkingOptions}</select>
      </div>
    </div>
  `;

  openModal(title, content, async () => {
    const data = {
      name: document.getElementById('f-biz-name').value.trim(),
      address: document.getElementById('f-biz-address').value.trim(),
      lat: parseFloat(document.getElementById('f-biz-lat').value),
      lng: parseFloat(document.getElementById('f-biz-lng').value),
      category: document.getElementById('f-biz-category').value,
      status: document.getElementById('f-biz-status').value,
      phone: document.getElementById('f-biz-phone').value.trim(),
      website: document.getElementById('f-biz-website').value.trim(),
      hours: document.getElementById('f-biz-hours').value.trim(),
      access_note: document.getElementById('f-biz-access-note').value.trim(),
      nearest_parking_id: document.getElementById('f-biz-parking').value || null
    };

    if (!data.name || isNaN(data.lat) || isNaN(data.lng)) {
      showToast('Name, Lat, and Lng are required', 'bg-red-600');
      return;
    }

    if (biz) {
      await updateRecord('businesses', biz.id, data);
    } else {
      await insertRecord('businesses', data);
    }
    await reloadData();
    closeModal();
    showToast(biz ? 'Business updated' : 'Business added', 'bg-green-600');
  });
}

async function handleBulkStatus() {
  const select = document.getElementById('bulk-status-select');
  if (!select || !select.value) return;

  const status = select.value;
  const sb = getAdminSupabase();
  await sb.from('businesses').update({ status }).neq('id', '');
  allBusinesses.forEach(b => b.status = status);
  renderBusinessTable();
  renderAdminMapFeatures();
  select.value = '';
  showToast(`All businesses set to ${status}`, 'bg-green-600');
}

// ============================================
// PHASES CRUD
// ============================================
function renderPhasesList() {
  const list = document.getElementById('phases-list');
  if (!list) return;

  list.innerHTML = allPhases.map(p => {
    const statusClass = `status-${p.status}`;
    const featureCount = allFeatures.filter(f => f.phase_id === p.id).length;
    return `
      <div class="phase-admin-item">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-semibold">${esc(p.name)}</span>
            <span class="status-badge ${statusClass}">${p.status}</span>
            <span class="text-xs text-gray-400">${featureCount} features</span>
          </div>
          <p class="text-sm text-gray-600">${esc(p.description || '')}</p>
          <div class="flex gap-3 text-xs text-gray-500 mt-1">
            ${p.start_date ? `<span>Start: ${p.start_date}</span>` : ''}
            ${p.duration_weeks ? `<span>Duration: ${p.duration_weeks} weeks</span>` : ''}
          </div>
        </div>
        <div class="flex gap-2">
          ${p.status !== 'active' ? `<button class="table-btn activate-phase" data-id="${p.id}">Activate</button>` : `<button class="table-btn deactivate-phase" data-id="${p.id}">Deactivate</button>`}
          <button class="table-btn edit-phase" data-id="${p.id}">Edit</button>
          <button class="table-btn table-btn-danger delete-phase" data-id="${p.id}">Delete</button>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.activate-phase').forEach(btn => {
    btn.addEventListener('click', async () => {
      await updateRecord('construction_phases', btn.dataset.id, { status: 'active' });
      // Activate associated features
      const sb = getAdminSupabase();
      await sb.from('map_features').update({ is_active: true }).eq('phase_id', btn.dataset.id);
      await reloadData();
      showToast('Phase activated', 'bg-green-600');
    });
  });

  list.querySelectorAll('.deactivate-phase').forEach(btn => {
    btn.addEventListener('click', async () => {
      await updateRecord('construction_phases', btn.dataset.id, { status: 'upcoming' });
      const sb = getAdminSupabase();
      await sb.from('map_features').update({ is_active: false }).eq('phase_id', btn.dataset.id);
      await reloadData();
      showToast('Phase deactivated', 'bg-green-600');
    });
  });

  list.querySelectorAll('.edit-phase').forEach(btn => {
    btn.addEventListener('click', () => {
      const phase = allPhases.find(p => p.id === btn.dataset.id);
      if (phase) showPhaseForm(phase);
    });
  });

  list.querySelectorAll('.delete-phase').forEach(btn => {
    btn.addEventListener('click', () => confirmDelete('construction_phases', btn.dataset.id, 'phase and all its features'));
  });
}

function showPhaseForm(phase = null) {
  const title = phase ? 'Edit Phase' : 'Add Phase';
  const content = `
    <div class="space-y-3">
      <div class="admin-field"><label>Name *</label><input type="text" id="f-phase-name" value="${esc(phase?.name || '')}" required></div>
      <div class="admin-field"><label>Description</label><textarea id="f-phase-desc" rows="2">${esc(phase?.description || '')}</textarea></div>
      <div class="grid grid-cols-2 gap-3">
        <div class="admin-field"><label>Start Date</label><input type="date" id="f-phase-start" value="${phase?.start_date || ''}"></div>
        <div class="admin-field"><label>End Date</label><input type="date" id="f-phase-end" value="${phase?.estimated_end_date || ''}"></div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="admin-field"><label>Duration (weeks)</label><input type="text" id="f-phase-duration" value="${esc(phase?.duration_weeks || '')}"></div>
        <div class="admin-field"><label>Sort Order</label><input type="number" id="f-phase-sort" value="${phase?.sort_order ?? 0}"></div>
      </div>
      <div class="admin-field"><label>Status</label>
        <select id="f-phase-status">
          <option value="upcoming" ${phase?.status === 'upcoming' ? 'selected' : ''}>Upcoming</option>
          <option value="active" ${phase?.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="completed" ${phase?.status === 'completed' ? 'selected' : ''}>Completed</option>
        </select>
      </div>
      <div class="admin-field"><label>Notes</label><textarea id="f-phase-notes" rows="2">${esc(phase?.notes || '')}</textarea></div>
    </div>
  `;

  openModal(title, content, async () => {
    const data = {
      name: document.getElementById('f-phase-name').value.trim(),
      description: document.getElementById('f-phase-desc').value.trim(),
      start_date: document.getElementById('f-phase-start').value || null,
      estimated_end_date: document.getElementById('f-phase-end').value || null,
      duration_weeks: document.getElementById('f-phase-duration').value.trim() || null,
      sort_order: parseInt(document.getElementById('f-phase-sort').value) || 0,
      status: document.getElementById('f-phase-status').value,
      notes: document.getElementById('f-phase-notes').value.trim()
    };

    if (!data.name) { showToast('Name is required', 'bg-red-600'); return; }

    if (phase) {
      await updateRecord('construction_phases', phase.id, data);
    } else {
      await insertRecord('construction_phases', data);
    }
    await reloadData();
    closeModal();
    showToast(phase ? 'Phase updated' : 'Phase added', 'bg-green-600');
  });
}

// ============================================
// MAP FEATURES TABLE
// ============================================
function renderFeaturesTable() {
  const tbody = document.getElementById('features-table-body');
  if (!tbody) return;

  tbody.innerHTML = allFeatures.map(f => {
    const phaseName = allPhases.find(p => p.id === f.phase_id)?.name || '-';
    return `
      <tr>
        <td class="px-4 py-3 font-medium">${esc(f.name)}</td>
        <td class="px-4 py-3 text-gray-600 text-xs">${esc(f.feature_type)}</td>
        <td class="px-4 py-3 text-gray-600 text-xs">${esc(phaseName)}</td>
        <td class="px-4 py-3 text-gray-600 text-xs">${esc(f.geometry_type)}</td>
        <td class="px-4 py-3">
          <div class="toggle-switch ${f.is_active ? 'active' : ''}" data-id="${f.id}" data-table="map_features" data-field="is_active"></div>
        </td>
        <td class="px-4 py-3 text-right">
          <button class="table-btn edit-feature" data-id="${f.id}">Edit</button>
          <button class="table-btn table-btn-danger delete-feature" data-id="${f.id}">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('click', () => handleToggle(toggle));
  });

  tbody.querySelectorAll('.edit-feature').forEach(btn => {
    btn.addEventListener('click', () => {
      const feature = allFeatures.find(f => f.id === btn.dataset.id);
      if (feature) showFeatureEditForm(feature);
    });
  });

  tbody.querySelectorAll('.delete-feature').forEach(btn => {
    btn.addEventListener('click', () => confirmDelete('map_features', btn.dataset.id, 'map feature'));
  });
}

function showFeatureEditForm(feature) {
  const phaseOptions = allPhases.map(p =>
    `<option value="${p.id}" ${feature.phase_id === p.id ? 'selected' : ''}>${esc(p.name)}</option>`
  ).join('');

  const content = `
    <div class="space-y-3">
      <div class="admin-field"><label>Name *</label><input type="text" id="f-feat-name" value="${esc(feature.name)}" required></div>
      <div class="admin-field"><label>Description</label><textarea id="f-feat-desc" rows="2">${esc(feature.description || '')}</textarea></div>
      <div class="grid grid-cols-2 gap-3">
        <div class="admin-field"><label>Type</label>
          <select id="f-feat-type">
            <option value="construction_zone" ${feature.feature_type === 'construction_zone' ? 'selected' : ''}>Construction Zone</option>
            <option value="road_closure" ${feature.feature_type === 'road_closure' ? 'selected' : ''}>Road Closure</option>
            <option value="detour_route" ${feature.feature_type === 'detour_route' ? 'selected' : ''}>Detour Route</option>
            <option value="local_traffic_only" ${feature.feature_type === 'local_traffic_only' ? 'selected' : ''}>Local Traffic Only</option>
            <option value="partial_barrier" ${feature.feature_type === 'partial_barrier' ? 'selected' : ''}>Partial Barrier</option>
            <option value="road_block" ${feature.feature_type === 'road_block' ? 'selected' : ''}>Road Block</option>
          </select>
        </div>
        <div class="admin-field"><label>Phase</label>
          <select id="f-feat-phase"><option value="">None</option>${phaseOptions}</select>
        </div>
      </div>
      <div class="admin-field"><label>Direction</label>
        <select id="f-feat-direction">
          <option value="" ${!feature.direction ? 'selected' : ''}>N/A</option>
          <option value="eastbound" ${feature.direction === 'eastbound' ? 'selected' : ''}>Eastbound</option>
          <option value="westbound" ${feature.direction === 'westbound' ? 'selected' : ''}>Westbound</option>
          <option value="both" ${feature.direction === 'both' ? 'selected' : ''}>Both</option>
        </select>
      </div>
      <div class="admin-field"><label>Color</label><input type="text" id="f-feat-color" value="${esc(feature.style_color || '')}" placeholder="#DC2626"></div>
      <label class="flex items-center gap-2"><input type="checkbox" id="f-feat-active" ${feature.is_active ? 'checked' : ''}> <span class="text-sm">Active</span></label>
    </div>
  `;

  openModal('Edit Map Feature', content, async () => {
    const data = {
      name: document.getElementById('f-feat-name').value.trim(),
      description: document.getElementById('f-feat-desc').value.trim(),
      feature_type: document.getElementById('f-feat-type').value,
      phase_id: document.getElementById('f-feat-phase').value || null,
      direction: document.getElementById('f-feat-direction').value || null,
      style_color: document.getElementById('f-feat-color').value.trim() || null,
      is_active: document.getElementById('f-feat-active').checked
    };

    if (!data.name) { showToast('Name is required', 'bg-red-600'); return; }

    await updateRecord('map_features', feature.id, data);
    await reloadData();
    closeModal();
    showToast('Feature updated', 'bg-green-600');
  });
}

function showFeatureForm(layer, layerType) {
  const phaseOptions = allPhases.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');

  let geometryType, geometryCoords;
  if (layerType === 'polygon') {
    geometryType = 'Polygon';
    geometryCoords = JSON.stringify(layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng]));
  } else if (layerType === 'polyline') {
    geometryType = 'LineString';
    geometryCoords = JSON.stringify(layer.getLatLngs().map(ll => [ll.lat, ll.lng]));
  } else if (layerType === 'marker') {
    geometryType = 'Point';
    const ll = layer.getLatLng();
    geometryCoords = JSON.stringify([ll.lat, ll.lng]);
  }

  const content = `
    <div class="space-y-3">
      <div class="admin-field"><label>Name *</label><input type="text" id="f-new-feat-name" required></div>
      <div class="admin-field"><label>Description</label><textarea id="f-new-feat-desc" rows="2"></textarea></div>
      <div class="grid grid-cols-2 gap-3">
        <div class="admin-field"><label>Type</label>
          <select id="f-new-feat-type">
            <option value="construction_zone">Construction Zone</option>
            <option value="road_closure">Road Closure</option>
            <option value="detour_route" ${layerType === 'polyline' ? 'selected' : ''}>Detour Route</option>
            <option value="local_traffic_only">Local Traffic Only</option>
            <option value="partial_barrier" ${layerType === 'marker' ? 'selected' : ''}>Partial Barrier</option>
            <option value="road_block">Road Block</option>
          </select>
        </div>
        <div class="admin-field"><label>Phase</label>
          <select id="f-new-feat-phase"><option value="">None</option>${phaseOptions}</select>
        </div>
      </div>
      <div class="admin-field"><label>Color</label><input type="text" id="f-new-feat-color" placeholder="#DC2626"></div>
    </div>
  `;

  openModal('New Map Feature', content, async () => {
    const data = {
      name: document.getElementById('f-new-feat-name').value.trim(),
      description: document.getElementById('f-new-feat-desc').value.trim(),
      feature_type: document.getElementById('f-new-feat-type').value,
      phase_id: document.getElementById('f-new-feat-phase').value || null,
      geometry_type: geometryType,
      geometry_coords: geometryCoords,
      style_color: document.getElementById('f-new-feat-color').value.trim() || null,
      is_active: true
    };

    if (!data.name) { showToast('Name is required', 'bg-red-600'); return; }

    await insertRecord('map_features', data);
    await reloadData();
    closeModal();
    showToast('Feature created', 'bg-green-600');
  });
}

function showBarrierForm(lat, lng) {
  const phaseOptions = allPhases.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');

  const content = `
    <div class="space-y-3">
      <div class="admin-field"><label>Name *</label><input type="text" id="f-barrier-name" required></div>
      <div class="admin-field"><label>Description</label><textarea id="f-barrier-desc" rows="2"></textarea></div>
      <div class="grid grid-cols-2 gap-3">
        <div class="admin-field"><label>Type</label>
          <select id="f-barrier-type">
            <option value="road_block">Road Block</option>
            <option value="partial_barrier">Partial Barrier</option>
          </select>
        </div>
        <div class="admin-field"><label>Phase</label>
          <select id="f-barrier-phase"><option value="">None</option>${phaseOptions}</select>
        </div>
      </div>
    </div>
  `;

  openModal('Add Barrier', content, async () => {
    const data = {
      name: document.getElementById('f-barrier-name').value.trim(),
      description: document.getElementById('f-barrier-desc').value.trim(),
      feature_type: document.getElementById('f-barrier-type').value,
      phase_id: document.getElementById('f-barrier-phase').value || null,
      geometry_type: 'Point',
      geometry_coords: JSON.stringify([lat, lng]),
      style_color: '#DC2626',
      is_active: true
    };

    if (!data.name) { showToast('Name is required', 'bg-red-600'); return; }

    await insertRecord('map_features', data);
    await reloadData();
    closeModal();
    showToast('Barrier added', 'bg-green-600');
  });
}

// ============================================
// GEOJSON IMPORT
// ============================================
async function handleGeoJSONImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const geojson = JSON.parse(text);
    const features = geojson.features || [geojson];
    let count = 0;

    for (const feature of features) {
      if (!feature.geometry) continue;

      const gType = feature.geometry.type;
      let geometryType, coords;

      if (gType === 'Polygon') {
        geometryType = 'Polygon';
        coords = feature.geometry.coordinates[0].map(c => [c[1], c[0]]);
      } else if (gType === 'LineString') {
        geometryType = 'LineString';
        coords = feature.geometry.coordinates.map(c => [c[1], c[0]]);
      } else if (gType === 'Point') {
        geometryType = 'Point';
        coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
      } else continue;

      await insertRecord('map_features', {
        name: feature.properties?.name || `Imported Feature ${count + 1}`,
        description: feature.properties?.description || '',
        feature_type: feature.properties?.feature_type || 'construction_zone',
        geometry_type: geometryType,
        geometry_coords: JSON.stringify(coords),
        style_color: feature.properties?.color || null,
        is_active: true
      });
      count++;
    }

    await reloadData();
    showToast(`Imported ${count} features`, 'bg-green-600');
  } catch (err) {
    showToast('Error importing GeoJSON: ' + err.message, 'bg-red-600');
  }

  e.target.value = '';
}

// ============================================
// SETTINGS
// ============================================
async function loadSettings() {
  const sb = getAdminSupabase();
  const { data } = await sb.from('app_settings').select('*');
  if (!data) return;

  const settings = {};
  data.forEach(row => { settings[row.key] = row.value; });

  if (settings.announcement) {
    document.getElementById('setting-announcement-text').value = settings.announcement.text || '';
    document.getElementById('setting-announcement-type').value = settings.announcement.type || 'warning';
    document.getElementById('setting-announcement-active').checked = settings.announcement.active !== false;
  }

  if (settings.contact_info) {
    document.getElementById('setting-contact-phone').value = settings.contact_info.phone || '';
    document.getElementById('setting-contact-website').value = settings.contact_info.website || '';
    document.getElementById('setting-contact-facebook').value = settings.contact_info.facebook || '';
  }
}

async function saveAnnouncement() {
  const sb = getAdminSupabase();
  const value = {
    text: document.getElementById('setting-announcement-text').value.trim(),
    type: document.getElementById('setting-announcement-type').value,
    active: document.getElementById('setting-announcement-active').checked
  };
  await sb.from('app_settings').upsert({ key: 'announcement', value });
  showToast('Announcement saved', 'bg-green-600');
}

async function saveContact() {
  const sb = getAdminSupabase();
  const value = {
    phone: document.getElementById('setting-contact-phone').value.trim(),
    website: document.getElementById('setting-contact-website').value.trim(),
    facebook: document.getElementById('setting-contact-facebook').value.trim()
  };
  await sb.from('app_settings').upsert({ key: 'contact_info', value });
  showToast('Contact info saved', 'bg-green-600');
}

// ============================================
// HELPERS
// ============================================
async function insertRecord(table, data) {
  const sb = getAdminSupabase();
  const { error } = await sb.from(table).insert(data);
  if (error) { showToast('Error: ' + error.message, 'bg-red-600'); throw error; }
}

async function updateRecord(table, id, data) {
  const sb = getAdminSupabase();
  const { error } = await sb.from(table).update(data).eq('id', id);
  if (error) { showToast('Error: ' + error.message, 'bg-red-600'); throw error; }
}

async function deleteRecord(table, id) {
  const sb = getAdminSupabase();
  const { error } = await sb.from(table).delete().eq('id', id);
  if (error) { showToast('Error: ' + error.message, 'bg-red-600'); throw error; }
}

async function handleToggle(toggle) {
  const table = toggle.dataset.table;
  const id = toggle.dataset.id;
  const field = toggle.dataset.field;
  const isActive = toggle.classList.contains('active');
  const newVal = !isActive;

  await updateRecord(table, id, { [field]: newVal });
  toggle.classList.toggle('active');
  showToast(`${field} ${newVal ? 'enabled' : 'disabled'}`, 'bg-green-600');
}

function confirmDelete(table, id, label) {
  const dialog = document.getElementById('confirm-dialog');
  const message = document.getElementById('confirm-message');
  const okBtn = document.getElementById('confirm-ok');

  if (!dialog || !message || !okBtn) return;

  message.textContent = `Are you sure you want to delete this ${label}? This cannot be undone.`;
  dialog.classList.remove('hidden');

  const handler = async () => {
    await deleteRecord(table, id);
    await reloadData();
    closeConfirm();
    showToast(`${label} deleted`, 'bg-green-600');
    okBtn.removeEventListener('click', handler);
  };

  okBtn.addEventListener('click', handler);
}

function closeConfirm() {
  document.getElementById('confirm-dialog')?.classList.add('hidden');
}

async function reloadData() {
  const sb = getAdminSupabase();
  const [phasesRes, parkingRes, bizRes, featuresRes] = await Promise.all([
    sb.from('construction_phases').select('*').order('sort_order'),
    sb.from('parking_lots').select('*').order('name'),
    sb.from('businesses').select('*').order('name'),
    sb.from('map_features').select('*')
  ]);
  allPhases = phasesRes.data || [];
  allParkingLots = parkingRes.data || [];
  allBusinesses = bizRes.data || [];
  allFeatures = featuresRes.data || [];

  renderParkingTable();
  renderBusinessTable();
  renderPhasesList();
  renderFeaturesTable();
  renderAdminMapFeatures();
}

// Modal
let modalSaveHandler = null;

function openModal(title, content, onSave) {
  const modal = document.getElementById('admin-modal');
  const titleEl = document.getElementById('admin-modal-title');
  const contentEl = document.getElementById('admin-modal-content');
  const saveBtn = document.getElementById('admin-modal-save');

  if (!modal || !titleEl || !contentEl) return;

  titleEl.textContent = title;
  contentEl.innerHTML = content;
  modal.classList.remove('hidden');

  if (modalSaveHandler) {
    saveBtn?.removeEventListener('click', modalSaveHandler);
  }
  modalSaveHandler = onSave;
  saveBtn?.addEventListener('click', modalSaveHandler);
}

function closeModal() {
  const modal = document.getElementById('admin-modal');
  modal?.classList.add('hidden');
  if (modalSaveHandler) {
    document.getElementById('admin-modal-save')?.removeEventListener('click', modalSaveHandler);
    modalSaveHandler = null;
  }
}

// Toast
function showToast(message, bgClass = 'bg-gray-800') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.className = `fixed bottom-4 right-4 z-[3000] px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${bgClass} show`;
  toast.textContent = message;

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Escape HTML helper
function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================
// MAP EDITOR FORM (for drawn features clicked from map)
// ============================================
function saveEditForm() {
  // Placeholder — handled by individual feature forms
}

function deleteEditItem() {
  // Placeholder — handled by individual feature forms
}

// Start
document.addEventListener('DOMContentLoaded', init);
