/**
 * @file kelurahan-table.component.js
 * @description View component for Tab 4 (Wilayah & SOP) Comparative Kelurahan Table in SI-BAHARI 3D.
 * Handles rendering, ranking sort order, and technical inspection triggers.
 */

export class KelurahanTableComponent {
  /**
   * @param {Object} options
   * @param {Function} options.onSelectKelurahan Callback when a row is clicked
   */
  constructor({ onSelectKelurahan } = {}) {
    this.tbody = null;
    this.onSelectKelurahan = onSelectKelurahan || (() => {});
  }

  init() {
    this.tbody = document.getElementById('kelurahan-table-body');
  }

  /**
   * Renders sorted kelurahan risk data into the table body
   * @param {Array<Object>} features GeoJSON Feature array
   */
  render(features) {
    if (!this.tbody) this.tbody = document.getElementById('kelurahan-table-body');
    if (!this.tbody || !Array.isArray(features)) return;

    this.tbody.innerHTML = '';

    // Sort ascending by ranking_kerentanan (Rank #1 is highest vulnerability)
    const sorted = [...features].sort((a, b) => {
      const rankA = a.properties?.ranking_kerentanan ?? 99;
      const rankB = b.properties?.ranking_kerentanan ?? 99;
      return rankA - rankB;
    });

    sorted.forEach(feat => {
      const p = feat.properties;
      const coords = feat.geometry?.coordinates?.[0]?.[0] || [109.1256, -6.8650];

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 cursor-pointer transition-colors';
      tr.innerHTML = `
        <td class="p-2 font-bold text-amber-600">#${p.ranking_kerentanan || '-'}</td>
        <td class="p-2 font-semibold text-slate-900">${p.nama_kelurahan || '-'}</td>
        <td class="p-2 text-slate-600">${p.elevasi_rata_m ?? '-'} m</td>
        <td class="p-2 text-rose-600 font-bold">${p.kk_terdampak_estimasi ?? 0} KK</td>
      `;

      tr.addEventListener('click', () => {
        this.onSelectKelurahan(p, coords);
      });

      this.tbody.appendChild(tr);
    });
  }
}
