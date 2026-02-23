// Main In Motion — Desktop Sidebar
import { getParkingData, highlightParking } from '../layers/parking.js';
import { getBusinessData, highlightBusiness } from '../layers/businesses.js';
import { getUserPosition } from '../geolocation.js';
import { distanceBetween, formatDistance, statusBadge, categoryIcon, escapeHtml } from '../utils.js';
import { showDirectionsFromUser } from '../directions.js';

export function initSidebar() {
  // Tabs
  document.querySelectorAll('.sidebar-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-tab').forEach(t => {
        t.classList.remove('active');
        t.classList.add('border-transparent', 'text-gray-500');
        t.classList.remove('border-navy', 'text-navy');
      });
      tab.classList.add('active', 'border-navy', 'text-navy');
      tab.classList.remove('border-transparent', 'text-gray-500');

      document.querySelectorAll('.sidebar-panel').forEach(p => p.classList.add('hidden'));
      const panel = document.getElementById('sidebar-' + tab.dataset.tab);
      if (panel) panel.classList.remove('hidden');
    });
  });

  // Business search
  const searchInput = document.getElementById('sidebar-biz-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderSidebarBusinessList());
  }

  // Business filters
  document.querySelectorAll('.sidebar-biz-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-biz-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSidebarBusinessList();
    });
  });
}

export function renderSidebarParkingList() {
  const list = document.getElementById('sidebar-parking-list');
  if (!list) return;

  const lots = getParkingData();
  const userPos = getUserPosition();

  let sorted = [...lots];
  if (userPos) {
    sorted.sort((a, b) => {
      const da = distanceBetween(userPos.lat, userPos.lng, a.lat, a.lng);
      const db = distanceBetween(userPos.lat, userPos.lng, b.lat, b.lng);
      return da - db;
    });
  }

  list.innerHTML = sorted.map(lot => {
    const dist = userPos ? formatDistance(distanceBetween(userPos.lat, userPos.lng, lot.lat, lot.lng)) : '';
    return `
      <div class="parking-item" data-lot-id="${lot.id}">
        <div class="parking-icon">P</div>
        <div class="parking-info">
          <div class="parking-name">${escapeHtml(lot.name)}</div>
          <div class="parking-detail">${lot.capacity || ''} ${dist ? '· ' + dist : ''} ${lot.hours ? '· ' + lot.hours : ''}</div>
        </div>
        <div class="parking-action">
          <button class="parking-dir-btn" data-lot-id="${lot.id}">Directions</button>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.parking-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.parking-dir-btn')) return;
      highlightParking(item.dataset.lotId);
    });
  });

  list.querySelectorAll('.parking-dir-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const lot = lots.find(l => l.id === btn.dataset.lotId);
      if (lot) showDirectionsFromUser(lot.lat, lot.lng);
    });
  });
}

export function renderSidebarBusinessList() {
  const list = document.getElementById('sidebar-business-list');
  if (!list) return;

  const businesses = getBusinessData();
  const activeFilter = document.querySelector('.sidebar-biz-filter.active');
  const category = activeFilter?.dataset.filter || 'all';
  const searchTerm = (document.getElementById('sidebar-biz-search')?.value || '').toLowerCase();

  let filtered = businesses;
  if (category !== 'all') {
    filtered = filtered.filter(b => b.category === category);
  }
  if (searchTerm) {
    filtered = filtered.filter(b =>
      b.name.toLowerCase().includes(searchTerm) ||
      (b.address || '').toLowerCase().includes(searchTerm)
    );
  }

  list.innerHTML = filtered.map(biz => `
    <div class="business-item" data-biz-id="${biz.id}">
      <div class="biz-dot ${biz.status || 'open'}"></div>
      <div class="biz-info">
        <div class="biz-name">${categoryIcon(biz.category)} ${escapeHtml(biz.name)}</div>
        <div class="biz-meta">${escapeHtml(biz.address || '')} · ${biz.category || ''} ${statusBadge(biz.status || 'open')}</div>
        ${biz.access_note ? `<div class="text-xs text-gray-400 mt-0.5">${escapeHtml(biz.access_note)}</div>` : ''}
      </div>
    </div>
  `).join('');

  if (filtered.length === 0) {
    list.innerHTML = '<div class="p-4 text-center text-gray-500 text-sm">No businesses found</div>';
  }

  list.querySelectorAll('.business-item').forEach(item => {
    item.addEventListener('click', () => highlightBusiness(item.dataset.bizId));
  });
}

export function renderSidebarInfoTab(phases, settings) {
  const timeline = document.getElementById('sidebar-info-timeline');
  const contact = document.getElementById('sidebar-info-contact');

  if (timeline && phases) {
    timeline.innerHTML = phases.map(p => {
      const badgeClass = p.status === 'active' ? 'phase-badge-active' : p.status === 'completed' ? 'phase-badge-completed' : 'phase-badge-upcoming';
      return `
        <div class="phase-item flex items-center gap-3">
          <span class="phase-badge ${badgeClass}">${p.status}</span>
          <div>
            <div class="font-medium text-sm text-gray-900">${escapeHtml(p.name)}</div>
            <div class="text-xs text-gray-500">${escapeHtml(p.description || '')}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  if (contact && settings.contact_info) {
    const info = settings.contact_info;
    let html = '';
    if (info.phone) html += `<p>📞 <a href="tel:${info.phone}" class="text-navy hover:underline">${info.phone}</a></p>`;
    if (info.website) html += `<p>🌐 <a href="${info.website}" target="_blank" class="text-navy hover:underline">Official Website</a></p>`;
    if (info.facebook) html += `<p>📱 ${escapeHtml(info.facebook)}</p>`;
    contact.innerHTML = html;
  }
}
