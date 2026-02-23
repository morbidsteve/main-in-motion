// Main In Motion — Public App Entry Point
import { initMap, getMap, centerMap } from './map.js';
import { initGeolocation } from './geolocation.js';
import { fetchParkingLots, fetchBusinesses, fetchConstructionPhases, fetchMapFeatures, fetchAppSettings, subscribeToChanges } from './supabase-client.js';
import { initParkingLayer } from './layers/parking.js';
import { initConstructionLayer } from './layers/construction.js';
import { initDetourLayer } from './layers/detours.js';
import { initBusinessLayer } from './layers/businesses.js';
import { initLayerToggle } from './ui/layer-toggle.js';
import { initBottomSheet, renderParkingList, renderBusinessList, renderInfoTab } from './ui/bottom-sheet.js';
import { initSidebar, renderSidebarParkingList, renderSidebarBusinessList, renderSidebarInfoTab } from './ui/sidebar.js';
import { initAnnouncement } from './ui/announcement.js';
import { escapeHtml } from './utils.js';

let phases = [];
let settings = {};

async function init() {
  // Initialize the map first
  initMap();

  // Initialize UI components
  initBottomSheet();
  initSidebar();
  initLayerToggle();
  initGeolocation();
  initPhaseModal();
  initMenuButton();

  // Fetch all data in parallel
  try {
    const [parkingData, businessData, phasesData, featuresData, settingsData] = await Promise.all([
      fetchParkingLots(),
      fetchBusinesses(),
      fetchConstructionPhases(),
      fetchMapFeatures(true),
      fetchAppSettings()
    ]);

    phases = phasesData;
    settings = settingsData;

    // Render map layers
    initParkingLayer(parkingData);
    initConstructionLayer(featuresData);
    initDetourLayer(featuresData);
    initBusinessLayer(businessData);

    // Render lists
    renderParkingList();
    renderBusinessList();
    renderInfoTab(phases, settings);
    renderSidebarParkingList();
    renderSidebarBusinessList();
    renderSidebarInfoTab(phases, settings);

    // Announcement banner
    initAnnouncement(settings);

    // Update phase badge
    updatePhaseBadge(phasesData);

    // Populate phase modal
    renderPhaseModal(phasesData);

    // Subscribe to realtime changes for live updates
    subscribeToChanges('parking_lots', () => reloadParkingData());
    subscribeToChanges('businesses', () => reloadBusinessData());
    subscribeToChanges('map_features', () => reloadMapFeatures());
    subscribeToChanges('construction_phases', () => reloadPhases());
    subscribeToChanges('app_settings', () => reloadSettings());

  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Reload functions for realtime updates
async function reloadParkingData() {
  const data = await fetchParkingLots();
  initParkingLayer(data);
  renderParkingList();
  renderSidebarParkingList();
}

async function reloadBusinessData() {
  const data = await fetchBusinesses();
  initBusinessLayer(data);
  renderBusinessList();
  renderSidebarBusinessList();
}

async function reloadMapFeatures() {
  const data = await fetchMapFeatures(true);
  initConstructionLayer(data);
  initDetourLayer(data);
}

async function reloadPhases() {
  phases = await fetchConstructionPhases();
  updatePhaseBadge(phases);
  renderPhaseModal(phases);
  renderInfoTab(phases, settings);
  renderSidebarInfoTab(phases, settings);
}

async function reloadSettings() {
  settings = await fetchAppSettings();
  initAnnouncement(settings);
  renderInfoTab(phases, settings);
  renderSidebarInfoTab(phases, settings);
}

// Phase badge
function updatePhaseBadge(phasesData) {
  const badge = document.getElementById('phase-badge');
  if (!badge) return;

  const active = phasesData.filter(p => p.status === 'active');
  if (active.length > 0) {
    badge.textContent = `${active[0].name} — Active`;
  } else {
    badge.textContent = 'No Active Phase';
  }
}

// Phase Modal
function initPhaseModal() {
  const badge = document.getElementById('phase-badge');
  const modal = document.getElementById('phase-modal');
  const backdrop = document.getElementById('phase-modal-backdrop');
  const closeBtn = document.getElementById('phase-modal-close');
  const previewSelect = document.getElementById('phase-preview-select');

  if (!badge || !modal) return;

  badge.addEventListener('click', () => modal.classList.remove('hidden'));
  backdrop?.addEventListener('click', () => modal.classList.add('hidden'));
  closeBtn?.addEventListener('click', () => modal.classList.add('hidden'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.add('hidden');
  });

  // Phase preview selector
  if (previewSelect) {
    previewSelect.addEventListener('change', async () => {
      const phaseId = previewSelect.value;
      if (!phaseId) {
        // Show current active features
        const data = await fetchMapFeatures(true);
        initConstructionLayer(data);
        initDetourLayer(data);
      } else {
        // Show all features for selected phase
        const allFeatures = await fetchMapFeatures(false);
        const phaseFeatures = allFeatures.filter(f => f.phase_id === phaseId);
        initConstructionLayer(phaseFeatures);
        initDetourLayer(phaseFeatures);
      }
    });
  }
}

function renderPhaseModal(phasesData) {
  const content = document.getElementById('phase-modal-content');
  const previewSelect = document.getElementById('phase-preview-select');

  if (content) {
    content.innerHTML = phasesData.map(p => {
      const badgeClass = p.status === 'active' ? 'phase-badge-active' : p.status === 'completed' ? 'phase-badge-completed' : 'phase-badge-upcoming';
      const dateStr = p.start_date ? new Date(p.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
      return `
        <div class="phase-item border-b border-gray-100 last:border-0">
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-semibold text-gray-900">${escapeHtml(p.name)}</h3>
            <span class="phase-badge ${badgeClass}">${p.status}</span>
          </div>
          <p class="text-sm text-gray-600">${escapeHtml(p.description || '')}</p>
          <div class="flex gap-4 mt-1 text-xs text-gray-500">
            ${dateStr ? `<span>📅 ${dateStr}</span>` : ''}
            ${p.duration_weeks ? `<span>⏱️ ${p.duration_weeks} weeks</span>` : ''}
          </div>
          ${p.notes ? `<p class="text-xs text-gray-400 mt-1 italic">${escapeHtml(p.notes)}</p>` : ''}
        </div>
      `;
    }).join('');
  }

  if (previewSelect) {
    const currentVal = previewSelect.value;
    previewSelect.innerHTML = '<option value="">Current active phases</option>' +
      phasesData.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (${p.status})</option>`).join('');
    previewSelect.value = currentVal;
  }
}

// Menu button (scroll header behavior)
function initMenuButton() {
  const header = document.getElementById('app-header');
  const menuBtn = document.getElementById('menu-btn');
  if (!menuBtn || !header) return;

  let headerVisible = true;

  menuBtn.addEventListener('click', () => {
    // Toggle bottom sheet on mobile
    const sheet = document.getElementById('bottom-sheet');
    if (sheet && window.innerWidth < 1024) {
      const content = document.getElementById('sheet-content');
      if (content && content.style.height === '0px' || content.style.height === '0') {
        // Expand to half
        const vh = window.innerHeight;
        sheet.style.transform = `translateY(${vh * 0.45}px)`;
        content.style.height = `${vh * 0.5}px`;
      }
    }
  });

  // Auto-hide header on scroll down in map
  const map = getMap();
  if (map) {
    map.on('movestart', () => {
      // Could add header collapse logic here if desired
    });
  }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
