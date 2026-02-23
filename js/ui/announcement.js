// Main In Motion — Announcement Banner
import { escapeHtml } from '../utils.js';

export function initAnnouncement(settings) {
  const banner = document.getElementById('announcement-banner');
  const text = document.getElementById('announcement-text');
  const dismissBtn = document.getElementById('announcement-dismiss');

  if (!banner || !text || !settings.announcement) return;

  const announcement = settings.announcement;

  if (!announcement.active) {
    banner.classList.add('hidden');
    return;
  }

  // Check if dismissed this session
  const dismissed = sessionStorage.getItem('announcement-dismissed');
  if (dismissed === announcement.text) {
    banner.classList.add('hidden');
    return;
  }

  text.textContent = announcement.text;

  // Style based on type
  banner.classList.remove('hidden', 'announcement-warning', 'announcement-info');
  if (announcement.type === 'info') {
    banner.classList.add('announcement-info');
    const icon = document.getElementById('announcement-icon');
    if (icon) icon.textContent = 'ℹ️';
  } else {
    banner.classList.add('announcement-warning');
  }

  // Dismiss
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      banner.classList.add('hidden');
      sessionStorage.setItem('announcement-dismissed', announcement.text);
    });
  }
}
