/**
 * @file drainage-list.component.js
 * @description View component for Tab 3 (Saluran & Sampah) in SI-BAHARI 3D.
 * Populates drainage bottlenecks and solid waste choke points, managing user interaction and inspection triggers.
 */

export class DrainageListComponent {
  constructor({ onSelectDrainage, onSelectWaste } = {}) {
    this.drainageContainer = null;
    this.wasteContainer = null;
    this.onSelectDrainage = onSelectDrainage || (() => {});
    this.onSelectWaste = onSelectWaste || (() => {});
  }

  init() {
    this.drainageContainer = document.getElementById('drainage-list-container');
    this.wasteContainer = document.getElementById('waste-list-container');
  }

  /**
   * Populates drainage bottleneck items into the DOM container
   * @param {Array<Object>} features GeoJSON Feature array
   */
  renderDrainage(features) {
    if (!this.drainageContainer) this.drainageContainer = document.getElementById('drainage-list-container');
    if (!this.drainageContainer || !Array.isArray(features)) return;

    this.drainageContainer.innerHTML = '';

    features.forEach(feat => {
      const p = feat.properties;
      const coords = feat.geometry?.coordinates;

      const item = document.createElement('div');
      item.className = 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-400 rounded-xl p-3 transition-all cursor-pointer space-y-1.5 shadow-sm';
      item.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 truncate max-w-[200px]">
            <svg class="w-3.5 h-3.5 text-sky-600 stroke-current shrink-0" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span class="font-bold text-slate-900 text-xs truncate">${p.lokasi || 'Saluran'}</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded ${(p.sediment_depth_cm || 0) >= 60 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
            ${p.sediment_depth_cm} cm
          </span>
        </div>
        <div class="text-[11px] text-slate-500 line-clamp-1">${p.clogging_source || '-'}</div>
        <div class="flex items-center justify-between text-[10px] font-semibold text-sky-700 pt-0.5">
          <span>Kel: ${p.kelurahan || '-'}</span>
          <span>Vol: ${p.volume_sedimen_m3 || 0} m³ (${p.ritase_dump_truck || 0} Rit)</span>
        </div>
      `;

      item.addEventListener('click', () => {
        this.onSelectDrainage(p, coords);
      });

      this.drainageContainer.appendChild(item);
    });
  }

  /**
   * Populates solid waste choke items into the DOM container
   * @param {Array<Object>} features GeoJSON Feature array
   */
  renderWaste(features) {
    if (!this.wasteContainer) this.wasteContainer = document.getElementById('waste-list-container');
    if (!this.wasteContainer || !Array.isArray(features)) return;

    this.wasteContainer.innerHTML = '';

    features.forEach(feat => {
      const p = feat.properties;
      const coords = feat.geometry?.coordinates;

      const item = document.createElement('div');
      item.className = 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-orange-400 rounded-xl p-3 transition-all cursor-pointer space-y-1.5 shadow-sm';
      item.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 truncate max-w-[200px]">
            <svg class="w-3.5 h-3.5 text-orange-600 stroke-current shrink-0" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            <span class="font-bold text-slate-900 text-xs truncate">${p.lokasi || 'Titik Sampah'}</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
            ${p.estimasi_volume_m3} m³
          </span>
        </div>
        <div class="text-[11px] text-slate-500 line-clamp-1">${p.karakteristik_sampah || '-'}</div>
        <div class="flex items-center justify-between text-[10px] font-semibold text-orange-700 pt-0.5">
          <span>Status: ${p.dampak_hidrologi || '-'}</span>
          <span>DLH Patrol</span>
        </div>
      `;

      item.addEventListener('click', () => {
        this.onSelectWaste(p, coords);
      });

      this.wasteContainer.appendChild(item);
    });
  }
}
