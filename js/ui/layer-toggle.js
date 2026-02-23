// Main In Motion — Layer Toggle
import { showParkingLayer, hideParkingLayer } from '../layers/parking.js';
import { showConstructionLayer, hideConstructionLayer } from '../layers/construction.js';
import { showDetourLayer, hideDetourLayer } from '../layers/detours.js';
import { showBusinessLayer, hideBusinessLayer } from '../layers/businesses.js';

export function initLayerToggle() {
  const toggleBtn = document.getElementById('layer-toggle-btn');
  const options = document.getElementById('layer-options');
  const chevron = document.getElementById('layer-chevron');

  if (!toggleBtn || !options) return;

  // Toggle dropdown
  toggleBtn.addEventListener('click', () => {
    const isOpen = !options.classList.contains('hidden');
    if (isOpen) {
      options.classList.add('hidden');
      if (chevron) chevron.style.transform = '';
    } else {
      options.classList.remove('hidden');
      if (chevron) chevron.style.transform = 'rotate(180deg)';
    }
  });

  // Layer checkboxes
  document.getElementById('layer-parking')?.addEventListener('change', (e) => {
    e.target.checked ? showParkingLayer() : hideParkingLayer();
  });

  document.getElementById('layer-construction')?.addEventListener('change', (e) => {
    e.target.checked ? showConstructionLayer() : hideConstructionLayer();
  });

  document.getElementById('layer-detours')?.addEventListener('change', (e) => {
    e.target.checked ? showDetourLayer() : hideDetourLayer();
  });

  document.getElementById('layer-businesses')?.addEventListener('change', (e) => {
    e.target.checked ? showBusinessLayer() : hideBusinessLayer();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    const toggle = document.getElementById('layer-toggle');
    if (toggle && !toggle.contains(e.target)) {
      options.classList.add('hidden');
      if (chevron) chevron.style.transform = '';
    }
  });
}
