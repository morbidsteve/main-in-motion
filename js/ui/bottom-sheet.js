// Main In Motion — Bottom Sheet (Mobile)
import { getParkingData, highlightParking } from '../layers/parking.js';
import { getBusinessData, highlightBusiness } from '../layers/businesses.js';
import { getUserPosition } from '../geolocation.js';
import { distanceBetween, formatDistance, statusBadge, categoryIcon, escapeHtml } from '../utils.js';
import { showDirectionsFromUser } from '../directions.js';

let sheetState = 'collapsed'; // 'collapsed', 'half', 'expanded'

export function initBottomSheet() {
  const sheet = document.getElementById('bottom-sheet');
  const handle = document.getElementById('sheet-handle');
  const expandBtn = document.getElementById('sheet-expand-btn');
  const content = document.getElementById('sheet-content');

  if (!sheet || !handle) return;

  // Handle drag
  let startY = 0;
  let startTransform = 0;

  handle.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    sheet.style.transition = 'none';
  }, { passive: true });

  handle.addEventListener('touchmove', (e) => {
    const deltaY = e.touches[0].clientY - startY;
    const vh = window.innerHeight;
    const collapsed = vh - 72;
    const current = sheetState === 'collapsed' ? collapsed : sheetState === 'half' ? vh * 0.45 : 0;
    const newY = Math.max(0, Math.min(collapsed, current + deltaY));
    sheet.style.transform = `translateY(${newY}px)`;
  }, { passive: true });

  handle.addEventListener('touchend', (e) => {
    sheet.style.transition = '';
    const currentY = parseTranslateY(sheet);
    const vh = window.innerHeight;

    if (currentY < vh * 0.25) {
      setSheetState('expanded');
    } else if (currentY < vh * 0.6) {
      setSheetState('half');
    } else {
      setSheetState('collapsed');
    }
  });

  // Click to toggle
  handle.addEventListener('click', () => {
    if (sheetState === 'collapsed') setSheetState('half');
    else if (sheetState === 'half') setSheetState('expanded');
    else setSheetState('collapsed');
  });

  if (expandBtn) {
    expandBtn.addEventListener('click', () => setSheetState('half'));
  }

  // Tabs
  document.querySelectorAll('.sheet-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sheet-tab').forEach(t => {
        t.classList.remove('active');
        t.classList.add('border-transparent', 'text-gray-500');
        t.classList.remove('border-navy', 'text-navy');
      });
      tab.classList.add('active', 'border-navy', 'text-navy');
      tab.classList.remove('border-transparent', 'text-gray-500');

      document.querySelectorAll('.sheet-panel').forEach(p => p.classList.add('hidden'));
      const panel = document.getElementById('tab-' + tab.dataset.tab);
      if (panel) panel.classList.remove('hidden');
    });
  });

  // Business search
  const searchInput = document.getElementById('biz-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderBusinessList());
  }

  // Business category filters
  document.querySelectorAll('.biz-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.biz-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderBusinessList();
    });
  });
}

function setSheetState(state) {
  sheetState = state;
  const sheet = document.getElementById('bottom-sheet');
  const content = document.getElementById('sheet-content');
  if (!sheet || !content) return;

  const vh = window.innerHeight;

  if (state === 'collapsed') {
    sheet.style.transform = `translateY(${vh - 72}px)`;
    content.style.height = '0';
  } else if (state === 'half') {
    sheet.style.transform = `translateY(${vh * 0.45}px)`;
    content.style.height = `${vh * 0.5}px`;
  } else {
    sheet.style.transform = 'translateY(52px)';
    content.style.height = `${vh - 124}px`;
  }
}

function parseTranslateY(el) {
  const transform = el.style.transform;
  const match = transform.match(/translateY\(([^)]+)\)/);
  if (!match) return window.innerHeight - 72;
  const val = match[1];
  if (val.includes('vh')) return (parseFloat(val) / 100) * window.innerHeight;
  if (val.includes('calc')) return window.innerHeight - 72;
  return parseFloat(val) || 0;
}

export function renderParkingList() {
  const list = document.getElementById('parking-list');
  const countEl = document.getElementById('lot-count');
  if (!list) return;

  const lots = getParkingData();
  const userPos = getUserPosition();

  if (countEl) countEl.textContent = `${lots.length} lots`;

  // Sort by distance if we have GPS
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
          <div class="parking-detail">${lot.capacity || ''} ${dist ? '· ' + dist : ''}</div>
        </div>
        <div class="parking-action">
          <button class="parking-dir-btn" data-lot-id="${lot.id}">Directions</button>
        </div>
      </div>
    `;
  }).join('');

  // Click handlers
  list.querySelectorAll('.parking-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.parking-dir-btn')) return;
      highlightParking(item.dataset.lotId);
      setSheetState('collapsed');
    });
  });

  list.querySelectorAll('.parking-dir-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const lot = lots.find(l => l.id === btn.dataset.lotId);
      if (lot) showDirectionsFromUser(lot.lat, lot.lng);
      setSheetState('collapsed');
    });
  });
}

export function renderBusinessList() {
  const list = document.getElementById('business-list');
  if (!list) return;

  const businesses = getBusinessData();
  const activeFilter = document.querySelector('.biz-filter.active');
  const category = activeFilter?.dataset.filter || 'all';
  const searchTerm = (document.getElementById('biz-search')?.value || '').toLowerCase();

  let filtered = businesses;
  if (category !== 'all') {
    filtered = filtered.filter(b => b.category === category);
  }
  if (searchTerm) {
    filtered = filtered.filter(b =>
      b.name.toLowerCase().includes(searchTerm) ||
      (b.address || '').toLowerCase().includes(searchTerm) ||
      (b.category || '').toLowerCase().includes(searchTerm)
    );
  }

  list.innerHTML = filtered.map(biz => `
    <div class="business-item" data-biz-id="${biz.id}">
      <div class="biz-dot ${biz.status || 'open'}"></div>
      <div class="biz-info">
        <div class="biz-name">${categoryIcon(biz.category)} ${escapeHtml(biz.name)}</div>
        <div class="biz-meta">${escapeHtml(biz.address || '')} ${biz.category ? '· ' + biz.category : ''} ${statusBadge(biz.status || 'open')}</div>
      </div>
    </div>
  `).join('');

  if (filtered.length === 0) {
    list.innerHTML = '<div class="p-4 text-center text-gray-500 text-sm">No businesses found</div>';
  }

  list.querySelectorAll('.business-item').forEach(item => {
    item.addEventListener('click', () => {
      highlightBusiness(item.dataset.bizId);
      setSheetState('collapsed');
    });
  });
}

export function renderInfoTab(phases, settings) {
  const timeline = document.getElementById('info-timeline');
  const contact = document.getElementById('info-contact');

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
