/**
 * @file inspector.template.js
 * @description Pure HTML template generators for SI-BAHARI 3D Technical Inspection Drawer.
 * Renders technical civil engineering metrics, SOPs, and causal multi-hazard profiles.
 */

// Named Constants for Engineering Metrics
const DUMP_TRUCK_CAPACITY_M3 = 6.0;
const SOLID_WASTE_DENSITY_TON_PER_M3 = 0.45;
const CRITICAL_SEDIMENT_THRESHOLD_CM = 60.0;

/**
 * Generates inspection markup for Drainage Bottleneck points
 * @param {Object} p Feature properties
 * @returns {string} HTML string
 */
export function renderDrainageInspection(p) {
  const isCritical = (p.sediment_depth_cm || 0) >= CRITICAL_SEDIMENT_THRESHOLD_CM;
  const kerugianFmt = (p.estimasi_kerugian_juta_rp || 0).toLocaleString('id-ID');

  return `
    <!-- Urgency Banner -->
    <div class="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
      <div>
        <div class="text-[10px] font-bold text-rose-700 uppercase tracking-wide">Status Saluran</div>
        <div class="font-extrabold text-rose-900 text-xs">${p.tingkat_kegawatan || 'Kritis'}</div>
      </div>
      <span class="text-xs font-black px-2.5 py-1 rounded bg-rose-600 text-white">${p.sediment_depth_cm} cm Sedimen</span>
    </div>

    <!-- Capacity Reduction Progress -->
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 shadow-sm">
      <div class="flex justify-between font-bold text-slate-800">
        <span>Kapasitas Debit Hilang</span>
        <span class="text-rose-600">${p.capacity_loss_pct}%</span>
      </div>
      <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div class="bg-rose-600 h-2.5 rounded-full" style="width: ${p.capacity_loss_pct}%"></div>
      </div>
      <div class="flex justify-between text-[10px] text-slate-500 font-medium">
        <span>Debit Sisa: ${p.debit_eksisting_m3s} m³/s</span>
        <span>Debit Desain: ${p.debit_rencana_m3s} m³/s</span>
      </div>
    </div>

    <!-- Engineering Metrics Grid -->
    <div class="grid grid-cols-2 gap-2">
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Dimensi Saluran (B x H)</div>
        <div class="font-bold text-slate-900 mt-0.5">${p.lebar_saluran_m}m x ${p.kedalaman_saluran_m}m</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Volume Sedimen Lumpur</div>
        <div class="font-bold text-sky-700 mt-0.5">${p.volume_sedimen_m3} m³</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Kebutuhan Rit Dump Truck</div>
        <div class="font-bold text-amber-700 mt-0.5">${p.ritase_dump_truck} Rit (${DUMP_TRUCK_CAPACITY_M3} m³)</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Dampak KK Terpapar</div>
        <div class="font-bold text-slate-900 mt-0.5">${p.kk_terdampak} Kepala Keluarga</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 col-span-2 shadow-sm">
        <div class="text-[10px] text-slate-500">Potensi Kerugian Ekonomi Genangan</div>
        <div class="font-bold text-rose-700 mt-0.5">Rp ${kerugianFmt} Juta</div>
      </div>
    </div>

    <!-- Action Plan & SOP -->
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 shadow-sm">
      <div class="font-bold text-sky-700 flex items-center gap-1.5">
        <svg class="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>
        <span>Rencana Operasional Penanganan PUPR</span>
      </div>
      <div class="space-y-1.5 text-[11px] text-slate-600">
        <div><strong class="text-slate-800">Alat Berat:</strong> ${p.sop_alat_berat}</div>
        <div><strong class="text-slate-800">Estimasi Durasi:</strong> ${p.durasi_pengerjaan_hari} Hari Kerja</div>
        <div><strong class="text-slate-800">Pelaksana:</strong> ${p.instansi_penanggung_jawab}</div>
        <div><strong class="text-slate-800">Penyebab:</strong> ${p.clogging_source}</div>
      </div>
    </div>
  `;
}

/**
 * Generates inspection markup for Solid Waste Choke Points
 * @param {Object} p Feature properties
 * @returns {string} HTML string
 */
export function renderWasteInspection(p) {
  const estimasiBeratTon = Math.round((p.estimasi_volume_m3 || 0) * SOLID_WASTE_DENSITY_TON_PER_M3);

  return `
    <!-- Urgency Banner -->
    <div class="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
      <div>
        <div class="text-[10px] font-bold text-orange-700 uppercase tracking-wide">Titik Sumbatan Sampah Saluran</div>
        <div class="font-extrabold text-orange-950 text-xs">${p.dampak_hidrologi || 'Hambatan Aliran'}</div>
      </div>
      <span class="text-xs font-black px-2.5 py-1 rounded bg-orange-600 text-white">${p.estimasi_volume_m3} m³ Sampah</span>
    </div>

    <!-- Waste Characteristics Grid -->
    <div class="grid grid-cols-2 gap-2">
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm col-span-2">
        <div class="text-[10px] text-slate-500">Karakteristik & Komposisi Limbah</div>
        <div class="font-bold text-slate-900 mt-0.5">${p.karakteristik_sampah}</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Estimasi Berat Limbah</div>
        <div class="font-bold text-orange-700 mt-0.5">± ${estimasiBeratTon} Ton</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Instansi Penanggung Jawab</div>
        <div class="font-bold text-sky-700 mt-0.5">Dinas Lingkungan Hidup</div>
      </div>
    </div>

    <!-- Action Plan -->
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 shadow-sm">
      <div class="font-bold text-slate-800 flex items-center gap-1.5">
        <svg class="w-4 h-4 text-orange-600 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        <span>Rencana Tindakan Pembersihan:</span>
      </div>
      <div class="text-[11px] text-slate-600 leading-relaxed">${p.rekomendasi_aksi}</div>
    </div>
  `;
}

/**
 * Generates inspection markup for Land Subsidence Zones
 * @param {Object} p Feature properties
 * @returns {string} HTML string
 */
export function renderSubsidenceInspection(p) {
  return `
    <!-- Urgency Banner -->
    <div class="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
      <div>
        <div class="text-[10px] font-bold text-purple-700 uppercase tracking-wide">Zonasi Penurunan Tanah (Subsidence)</div>
        <div class="font-extrabold text-purple-950 text-xs">${p.tingkat_urgensi}</div>
      </div>
      <span class="text-xs font-black px-2.5 py-1 rounded bg-purple-600 text-white">${p.laju_penurunan_cm_tahun} cm/th</span>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Akumulasi Amblesan 10 Tahun</div>
        <div class="font-black text-purple-700 mt-0.5">${p.akumulasi_penurunan_10th_cm} cm (Turun)</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Struktur Geologi</div>
        <div class="font-bold text-slate-900 mt-0.5 text-[11px]">${p.formasi_geologi}</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 col-span-2 shadow-sm">
        <div class="text-[10px] text-slate-500">Faktor Pemicu Utama</div>
        <div class="font-bold text-slate-800 mt-0.5 text-[11px] leading-snug">${p.faktor_penyebab}</div>
      </div>
    </div>

    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-sm">
      <div class="font-bold text-purple-800">Rekomendasi Penyelamatan Struktur:</div>
      <div class="text-[11px] text-slate-600 leading-relaxed">${p.rekomendasi_mitigasi}</div>
    </div>
  `;
}

/**
 * Generates inspection markup for Saline Water Intrusion Buffer
 * @param {Object} p Feature properties
 * @returns {string} HTML string
 */
export function renderSalineInspection(p) {
  return `
    <!-- Banner -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
      <div>
        <div class="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Intrusi Air Laut ke Air Tanah</div>
        <div class="font-extrabold text-amber-950 text-xs">${p.status_air_sumur}</div>
      </div>
      <span class="text-xs font-black px-2.5 py-1 rounded bg-amber-600 text-white">${p.salinitas_air_tanah_ppt} ppt</span>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Daya Hantar Listrik (DHL)</div>
        <div class="font-bold text-slate-900 mt-0.5">${p.daya_hantar_listrik_us_cm} µS/cm</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Jangkauan Buffer Garis Pantai</div>
        <div class="font-bold text-amber-700 mt-0.5">1.5 Kilometer Daratan</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 col-span-2 shadow-sm">
        <div class="text-[10px] text-slate-500">Dampak Langsung pada Penduduk</div>
        <div class="font-bold text-slate-800 mt-0.5 text-[11px] leading-snug">${p.dampak_warga}</div>
      </div>
    </div>

    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-sm">
      <div class="font-bold text-amber-800">Rencana Intervensi PDAM & Pemkot:</div>
      <div class="text-[11px] text-slate-600 leading-relaxed">${p.rekomendasi}</div>
    </div>
  `;
}

/**
 * Generates inspection markup for Kelurahan Urban Risk
 * @param {Object} p Feature properties
 * @returns {string} HTML string
 */
export function renderKelurahanInspection(p) {
  const pendudukFmt = (p.jumlah_penduduk_jiwa || 0).toLocaleString('id-ID');

  return `
    <div class="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
      <div>
        <div class="text-[10px] font-bold text-sky-700 uppercase">Peringkat Kerentanan</div>
        <div class="font-extrabold text-slate-900 text-sm">Ranking #${p.ranking_kerentanan || '-'} di Kota Tegal</div>
      </div>
      <span class="text-xs font-black px-2.5 py-1 rounded bg-sky-600 text-white">${p.elevasi_rata_m} mdpl</span>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Luas Wilayah</div>
        <div class="font-bold text-slate-900 mt-0.5">${p.luas_wilayah_ha} Hektar</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Jumlah Penduduk</div>
        <div class="font-bold text-slate-900 mt-0.5">${pendudukFmt} Jiwa</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Estimasi KK Terdampak</div>
        <div class="font-bold text-rose-700 mt-0.5">${p.kk_terdampak_estimasi} KK</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Skor Risiko AHP</div>
        <div class="font-bold text-amber-700 mt-0.5">${p.skor_ahp_risiko || '-'} (${p.klasifikasi_risiko || '-'})</div>
      </div>
    </div>

    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 shadow-sm">
      <div class="font-bold text-slate-800">Tipe Ancaman & Rukun Warga (RW) Terpapar:</div>
      <div class="text-xs text-rose-700 font-semibold">${p.tipe_ancaman}</div>
      <div class="text-[11px] text-slate-500">Wilayah Rawan: ${p.rw_terdampak_list || '-'}</div>
    </div>

    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-sm">
      <div class="font-bold text-sky-700">Rekomendasi Kebijakan:</div>
      <div class="text-[11px] text-slate-600 leading-relaxed">${p.rekomendasi_mitigasi || '-'}</div>
    </div>
  `;
}

/**
 * Generates inspection markup for Guci Watershed Slope
 * @param {Object} p Feature properties
 * @returns {string} HTML string
 */
export function renderGuciInspection(p) {
  return `
    <div class="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
      <div>
        <div class="text-[10px] font-bold text-rose-700 uppercase">Kawasan Hulu Slamet</div>
        <div class="font-extrabold text-rose-950 text-xs">Zona Rawan Banjir Bandang & Debris Flow</div>
      </div>
      <span class="text-xs font-black px-2.5 py-1 rounded bg-rose-600 text-white">${p.elevasi_rata_m} mdpl</span>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Kemiringan Lereng</div>
        <div class="font-bold text-rose-700 mt-0.5">${p.kemiringan_lereng_derajat}° (Curam)</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Alih Fungsi Hutan</div>
        <div class="font-bold text-amber-700 mt-0.5">${p.tingkat_alih_fungsi_lahan_pct}% Terbuka</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 col-span-2 shadow-sm">
        <div class="text-[10px] text-slate-500">Curah Hujan Ekstrem Pemicu</div>
        <div class="font-bold text-sky-700 mt-0.5">${p.curah_hujan_ekstrem_mm_hari} mm/hari (Hujan Badai)</div>
      </div>
    </div>

    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-sm">
      <div class="font-bold text-slate-800">Riwayat Kejadian Bencana:</div>
      <div class="text-[11px] text-slate-600 leading-relaxed">${p.keterangan_bencana}</div>
    </div>

    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-sm">
      <div class="font-bold text-emerald-700">Prioritas Mitigasi Sipil & Ekologis:</div>
      <div class="text-[11px] text-slate-600 leading-relaxed">${p.prioritas_mitigasi}</div>
    </div>
  `;
}

/**
 * Generates inspection markup for Polder Pump Station
 * @param {Object} p Feature properties
 * @returns {string} HTML string
 */
export function renderPolderInspection(p) {
  const isPumpActive = p.is_active;

  return `
    <!-- Polder Status Banner -->
    <div class="${isPumpActive ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'} border rounded-xl p-3 flex items-center justify-between shadow-sm">
      <div>
        <div class="text-[10px] font-bold uppercase tracking-wide">Status Operasional Pompa</div>
        <div class="font-extrabold text-xs">${p.current_status}</div>
      </div>
      <span class="text-xs font-black px-2.5 py-1 rounded ${isPumpActive ? 'bg-emerald-600' : 'bg-rose-600'} text-white">
        ${isPumpActive ? '1.500 L/s Aktif' : '0 L/s (Mati)'}
      </span>
    </div>

    <!-- Civil Engineering Specs Grid -->
    <div class="grid grid-cols-2 gap-2">
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Kapasitas Kolam Retensi</div>
        <div class="font-bold text-sky-700 mt-0.5">${p.retention_pond_volume}</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
        <div class="text-[10px] text-slate-500">Tinggi Tanggul Pelindung</div>
        <div class="font-bold text-slate-900 mt-0.5">${p.dyke_crest_level}</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 col-span-2 shadow-sm">
        <div class="text-[10px] text-slate-500">Konfigurasi Unit Mesin Pompa</div>
        <div class="font-bold text-slate-900 mt-0.5 text-[11px]">${p.pump_units}</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-2.5 col-span-2 shadow-sm">
        <div class="text-[10px] text-slate-500">Cadangan Daya Darurat (Blackout Backup)</div>
        <div class="font-bold text-amber-700 mt-0.5 text-[11px]">${p.backup_power}</div>
      </div>
    </div>

    <!-- Catchment Area & Protection Impact -->
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-sm">
      <div class="font-bold text-slate-800 flex items-center gap-1.5">
        <svg class="w-4 h-4 text-sky-600 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        <span>Wilayah Tangkapan Terlindungi:</span>
      </div>
      <div class="text-[11px] text-slate-600 leading-relaxed">${p.catchment_area}</div>
      <div class="text-[10px] text-slate-500 pt-1">
        <strong>Instansi Pembina:</strong> ${p.operational_agency}
      </div>
    </div>
  `;
}

