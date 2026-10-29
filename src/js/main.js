/**
 * @file main.js
 * @description Master application coordinator for Tegal 3D Digital Twin
 * (Light Mode Enterprise + Pure SVG Icons + Causal Multi-Hazard Drivers + 60 FPS).
 */

import { TerrainManager } from './layers/terrain.layer.js';
import { CameraController } from './controllers/camera.controller.js';
import { BuildingsLayer } from './layers/buildings.layer.js';
import { HazardLayer } from './layers/hazard.layer.js';
import { WaterSimulationLayer } from './layers/water.shader.js';
import { SimulationController } from './controllers/simulation.controller.js';
import { LandingComponent } from './components/landing/landing.component.js';
import { TutorialComponent } from './components/tutorial/tutorial.component.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[SI-BAHARI 3D] Initializing Light Mode Enterprise App Shell...');

  let simulationControllerInstance = null;

  try {
    // 1. Initialize Map with Satellite Basemap
    const map = TerrainManager.createMap('map');
    const cameraController = new CameraController(map);

    // 2. Initialize Native Game-Style Interactive Tutorial
    const tutorialComponent = new TutorialComponent({
      cameraController,
      onComplete: () => {
        console.log('[SI-BAHARI 3D] Interactive Walkthrough completed.');
      }
    });

    // 3. Initialize Modular Landing Page Component (Onboarding Portal)
    const landingComponent = new LandingComponent({
      onExplore: () => {
        cameraController.flyToZone('KOTA_TEGAL');
      },
      onQuickScenario: (scenarioKey) => {
        cameraController.flyToZone('KOTA_TEGAL');
        if (simulationControllerInstance) {
          simulationControllerInstance.applyScenario(scenarioKey);
        }
      },
      onStartTutorial: () => {
        tutorialComponent.start();
      }
    });
    landingComponent.init();

    // 4. Setup Top Application Bar Controls, Re-open Guide & Tutorial Buttons
    _setupHeaderControls(map, cameraController, landingComponent, tutorialComponent);

    // 4. Setup Drawer Tabs & Hamburger Collapse
    _setupDrawerTabs();

    // 5. Setup Inspector Drawer Close Button
    const btnCloseInspector = document.getElementById('btn-close-inspector');
    const inspectorDrawer = document.getElementById('inspector-drawer');
    if (btnCloseInspector && inspectorDrawer) {
      btnCloseInspector.addEventListener('click', () => {
        inspectorDrawer.classList.remove('translate-x-0');
      });
    }

    // 6. Map Load Event: Bind Spatial Layers & Controllers
    map.on('load', async () => {
      console.log('[SI-BAHARI 3D] Map loaded. Binding high-performance layers...');

      const buildingsLayer = new BuildingsLayer(map);
      const hazardLayer = new HazardLayer(map);
      const waterLayer = new WaterSimulationLayer(map);

      // Initialize Native GPU Water Inundation Layer (Starts dry at 0.0m)
      waterLayer.init();

      // Resolve data path fail-safe
      const basePath = window.location.pathname.includes('/src/') ? '../data/processed' : './data/processed';

      const dataUrls = {
        buildings: `${basePath}/buildings_footprints_tegal.geojson`,
        urbanRisk: `${basePath}/tegal_hybrid_risk.geojson`,
        guciRisk: `${basePath}/guci_landslide_risk.geojson`,
        drainage: `${basePath}/drainage_critical_points.geojson`,
        subsidence: `${basePath}/tegal_land_subsidence.geojson`,
        saline: `${basePath}/tegal_saline_intrusion.geojson`,
        waste: `${basePath}/drainage_waste_chokes.geojson`
      };

      await Promise.all([
        buildingsLayer.init(dataUrls.buildings),
        hazardLayer.init(dataUrls)
      ]);

      // Wire feature inspection callback from Map clicks to Inspector Drawer
      hazardLayer.setOnInspect((type, props) => {
        _openInspector(type, props, cameraController);
      });

      // Initialize Simulation Controller with RAF batching
      simulationControllerInstance = new SimulationController({
        waterLayer,
        buildingsLayer,
        hazardLayer
      });
      simulationControllerInstance.init();

      // Populate Tab 3 (Drainage & Waste Lists) & Tab 4 (Kelurahan Table)
      _populateDrainageList(dataUrls.drainage, cameraController);
      _populateWasteList(dataUrls.waste, cameraController);
      _populateKelurahanTable(dataUrls.urbanRisk, cameraController);

      // Setup Layer Toggles in Tab 2
      _setupLayerToggles({ buildingsLayer, hazardLayer, waterLayer });

      // Wire Polder Pump Inspector Button
      const btnInspectPolder = document.getElementById('btn-inspect-polder');
      if (btnInspectPolder) {
        btnInspectPolder.addEventListener('click', () => {
          cameraController.flyToSpot([109.1350, -6.8530], 16.0, 50.0);
          _openInspector('POLDER', {
            name: 'Stasiun Pompa Polder Kolam Retensi Tegalsari',
            catchment_area: 'Tegalsari RW 01–07 & Muarareja Pesisir (185.4 Ha)',
            pump_units: '3 Unit Pompa Submersible Axial Flow (3x 500 L/s)',
            total_capacity_debit: '1.500 Liter/detik (5.400 m³/jam)',
            retention_pond_volume: '45.000 m³ (Kolam Retensi Utama)',
            dyke_crest_level: '+1.60 mdpl (Elevasi Puncak Tanggul Keliling)',
            backup_power: 'Automatic Genset Diesel Silent 250 kVA (Siaga 24 Jam)',
            operational_agency: 'DPUPR Kota Tegal & BBWS Pemali-Juana',
            current_status: simulationControllerInstance.isPumpActive ? 'AKTIF BEROPERASI' : 'GAGAL / MATI TOTAL',
            is_active: simulationControllerInstance.isPumpActive
          }, cameraController);
        });
      }

      console.log('[SI-BAHARI 3D] System operational in Light Mode Enterprise at 60 FPS.');
    });

  } catch (err) {
    console.error('[SI-BAHARI 3D] Bootstrap error:', err);
  }
});

/**
 * Handles Top Bar Controls (Light Theme)
 * @private
 */
function _setupHeaderControls(map, cameraController, landingComponent, tutorialComponent) {
  // Launch Interactive Walkthrough Tutorial Button
  const btnOpenTutorial = document.getElementById('btn-open-tutorial');
  if (btnOpenTutorial && tutorialComponent) {
    btnOpenTutorial.addEventListener('click', () => {
      if (landingComponent && landingComponent.isVisible()) {
        landingComponent.hide();
      }
      tutorialComponent.start();
    });
  }

  // Re-open Landing Guide Button
  const btnOpenGuide = document.getElementById('btn-open-guide');
  if (btnOpenGuide && landingComponent) {
    btnOpenGuide.addEventListener('click', () => {
      if (tutorialComponent && tutorialComponent.isActive) {
        tutorialComponent.stop();
      }
      landingComponent.show();
    });
  }

  // Drawer Toggle (Hamburger)
  const btnToggleDrawer = document.getElementById('btn-toggle-drawer');
  const drawer = document.getElementById('app-drawer');
  if (btnToggleDrawer && drawer) {
    btnToggleDrawer.addEventListener('click', () => {
      drawer.classList.toggle('-translate-x-full');
    });
  }

  // Zone Quick Switchers
  const btnTegal = document.getElementById('btn-zone-tegal');
  const btnGuci = document.getElementById('btn-zone-guci');
  const simDock = document.querySelector('section.absolute.bottom-5');

  const activeZoneClass = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all text-sky-800 bg-white shadow-sm border border-slate-200 cursor-pointer flex items-center gap-1.5';
  const inactiveZoneClass = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1.5';

  if (btnTegal && btnGuci) {
    btnTegal.addEventListener('click', () => {
      btnTegal.className = activeZoneClass;
      btnGuci.className = inactiveZoneClass;
      cameraController.flyToZone('KOTA_TEGAL');
      if (simDock) simDock.style.display = 'flex';
    });

    btnGuci.addEventListener('click', () => {
      btnGuci.className = activeZoneClass;
      btnTegal.className = inactiveZoneClass;
      cameraController.flyToZone('GUCI_BUMIJAWA');
      if (simDock) simDock.style.display = 'none';
    });
  }

  // Basemap Selector
  const selectBasemap = document.getElementById('select-basemap');
  if (selectBasemap) {
    selectBasemap.addEventListener('change', (e) => {
      TerrainManager.switchBasemap(map, e.target.value);
    });
  }

  // Reset North
  const btnResetNorth = document.getElementById('btn-reset-north');
  if (btnResetNorth) {
    btnResetNorth.addEventListener('click', () => {
      cameraController.resetNorth();
    });
  }

  // Fullscreen
  const btnFullscreen = document.getElementById('btn-fullscreen');
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(e => console.warn(e));
      } else {
        document.exitFullscreen().catch(e => console.warn(e));
      }
    });
  }
}

/**
 * Handles Tab Navigation in Left Drawer (Light Theme)
 * @private
 */
function _setupDrawerTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');

      // Update button styling for light theme
      tabButtons.forEach(b => {
        b.className = 'tab-btn flex-1 py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 border-b-2 border-transparent flex flex-col items-center gap-1.5 transition-all';
      });
      btn.className = 'tab-btn active flex-1 py-3 text-xs font-bold text-sky-600 border-b-2 border-sky-600 bg-white flex flex-col items-center gap-1.5 transition-all';

      // Update pane visibility
      tabPanes.forEach(pane => {
        if (pane.id === targetTabId) {
          pane.classList.remove('hidden');
        } else {
          pane.classList.add('hidden');
        }
      });
    });
  });
}

/**
 * Opens Slide-Over Technical Inspector Drawer with Light Mode styling & SVG icons
 * @private
 */
function _openInspector(type, p, cameraController) {
  const drawer = document.getElementById('inspector-drawer');
  const title = document.getElementById('inspector-title');
  const body = document.getElementById('inspector-body');
  if (!drawer || !title || !body) return;

  if (type === 'DRAINAGE') {
    title.textContent = p.lokasi;
    body.innerHTML = `
      <!-- Urgency Banner -->
      <div class="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
        <div>
          <div class="text-[10px] font-bold text-rose-700 uppercase tracking-wide">Status Saluran</div>
          <div class="font-extrabold text-rose-900 text-xs">${p.tingkat_kegawatan}</div>
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
          <div class="font-bold text-amber-700 mt-0.5">${p.ritase_dump_truck} Rit (6 m³)</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
          <div class="text-[10px] text-slate-500">Dampak KK Terpapar</div>
          <div class="font-bold text-slate-900 mt-0.5">${p.kk_terdampak} Kepala Keluarga</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-lg p-2.5 col-span-2 shadow-sm">
          <div class="text-[10px] text-slate-500">Potensi Kerugian Ekonomi Genangan</div>
          <div class="font-bold text-rose-700 mt-0.5">Rp ${(p.estimasi_kerugian_juta_rp || 0).toLocaleString('id-ID')} Juta</div>
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
  } else if (type === 'WASTE') {
    title.textContent = p.lokasi;
    body.innerHTML = `
      <!-- Urgency Banner -->
      <div class="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
        <div>
          <div class="text-[10px] font-bold text-orange-700 uppercase tracking-wide">Titik Sumbatan Sampah Saluran</div>
          <div class="font-extrabold text-orange-950 text-xs">${p.dampak_hidrologi}</div>
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
          <div class="font-bold text-orange-700 mt-0.5">± ${Math.round(p.estimasi_volume_m3 * 0.45)} Ton</div>
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
  } else if (type === 'SUBSIDENCE') {
    title.textContent = p.nama_zona;
    body.innerHTML = `
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
  } else if (type === 'SALINE') {
    title.textContent = p.nama_zona;
    body.innerHTML = `
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
  } else if (type === 'KELURAHAN') {
    title.textContent = `Kelurahan ${p.nama_kelurahan}`;
    body.innerHTML = `
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
          <div class="font-bold text-slate-900 mt-0.5">${(p.jumlah_penduduk_jiwa || 0).toLocaleString('id-ID')} Jiwa</div>
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
  } else if (type === 'GUCI') {
    title.textContent = p.nama_desa;
    body.innerHTML = `
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
  } else if (type === 'POLDER') {
    title.textContent = p.name;
    body.innerHTML = `
      <!-- Polder Status Banner -->
      <div class="${p.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'} border rounded-xl p-3 flex items-center justify-between shadow-sm">
        <div>
          <div class="text-[10px] font-bold uppercase tracking-wide">Status Operasional Pompa</div>
          <div class="font-extrabold text-xs">${p.current_status}</div>
        </div>
        <span class="text-xs font-black px-2.5 py-1 rounded ${p.is_active ? 'bg-emerald-600' : 'bg-rose-600'} text-white">
          ${p.is_active ? '1.500 L/s Aktif' : '0 L/s (Mati)'}
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

  drawer.classList.add('translate-x-0');
}

/**
 * Populates Tab 3 with drainage bottleneck cards (Light Theme)
 * @private
 */
async function _populateDrainageList(url, cameraController) {
  const container = document.getElementById('drainage-list-container');
  if (!container) return;

  try {
    const res = await fetch(url);
    const data = await res.json();
    container.innerHTML = '';

    data.features.forEach(feat => {
      const p = feat.properties;
      const coords = feat.geometry.coordinates;

      const item = document.createElement('div');
      item.className = 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-400 rounded-xl p-3 transition-all cursor-pointer space-y-1.5 shadow-sm';
      item.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 truncate max-w-[200px]">
            <svg class="w-3.5 h-3.5 text-sky-600 stroke-current shrink-0" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span class="font-bold text-slate-900 text-xs truncate">${p.lokasi}</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded ${p.sediment_depth_cm >= 60 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
            ${p.sediment_depth_cm} cm
          </span>
        </div>
        <div class="text-[11px] text-slate-500 line-clamp-1">${p.clogging_source}</div>
        <div class="flex items-center justify-between text-[10px] font-semibold text-sky-700 pt-0.5">
          <span>Kel: ${p.kelurahan}</span>
          <span>Vol: ${p.volume_sedimen_m3} m³ (${p.ritase_dump_truck} Rit)</span>
        </div>
      `;

      item.addEventListener('click', () => {
        cameraController.flyToSpot(coords, 16.5, 55.0);
        _openInspector('DRAINAGE', p, cameraController);
      });

      container.appendChild(item);
    });
  } catch (err) {
    console.error('[Tegal WebGIS 2.0] Failed to populate drainage list:', err);
  }
}

/**
 * Populates Tab 3 with solid waste choke point cards (Light Theme)
 * @private
 */
async function _populateWasteList(url, cameraController) {
  const container = document.getElementById('waste-list-container');
  if (!container) return;

  try {
    const res = await fetch(url);
    const data = await res.json();
    container.innerHTML = '';

    data.features.forEach(feat => {
      const p = feat.properties;
      const coords = feat.geometry.coordinates;

      const item = document.createElement('div');
      item.className = 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-orange-400 rounded-xl p-3 transition-all cursor-pointer space-y-1.5 shadow-sm';
      item.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 truncate max-w-[200px]">
            <svg class="w-3.5 h-3.5 text-orange-600 stroke-current shrink-0" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            <span class="font-bold text-slate-900 text-xs truncate">${p.lokasi}</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
            ${p.estimasi_volume_m3} m³
          </span>
        </div>
        <div class="text-[11px] text-slate-500 line-clamp-1">${p.karakteristik_sampah}</div>
        <div class="flex items-center justify-between text-[10px] font-semibold text-orange-700 pt-0.5">
          <span>Status: ${p.dampak_hidrologi}</span>
          <span>DLH Patrol</span>
        </div>
      `;

      item.addEventListener('click', () => {
        cameraController.flyToSpot(coords, 16.5, 55.0);
        _openInspector('WASTE', p, cameraController);
      });

      container.appendChild(item);
    });
  } catch (err) {
    console.error('[Tegal WebGIS 2.0] Failed to populate waste list:', err);
  }
}

/**
 * Populates Tab 4 with Comparative Kelurahan Table (Light Theme)
 * @private
 */
async function _populateKelurahanTable(url, cameraController) {
  const tbody = document.getElementById('kelurahan-table-body');
  if (!tbody) return;

  try {
    const res = await fetch(url);
    const data = await res.json();
    tbody.innerHTML = '';

    const sorted = data.features.sort((a, b) => (a.properties.ranking_kerentanan || 99) - (b.properties.ranking_kerentanan || 99));

    sorted.forEach(feat => {
      const p = feat.properties;
      const coords = feat.geometry.coordinates[0][0];

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 cursor-pointer transition-colors';
      tr.innerHTML = `
        <td class="p-2 font-bold text-amber-600">#${p.ranking_kerentanan || '-'}</td>
        <td class="p-2 font-semibold text-slate-900">${p.nama_kelurahan}</td>
        <td class="p-2 text-slate-600">${p.elevasi_rata_m} m</td>
        <td class="p-2 text-rose-600 font-bold">${p.kk_terdampak_estimasi} KK</td>
      `;

      tr.addEventListener('click', () => {
        cameraController.flyToSpot(coords, 15.0, 45.0);
        _openInspector('KELURAHAN', p, cameraController);
      });

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('[Tegal WebGIS 2.0] Failed to populate kelurahan table:', err);
  }
}

/**
 * Layer switches wiring for all Multi-Hazard Causal Layers
 * @private
 */
function _setupLayerToggles({ buildingsLayer, hazardLayer, waterLayer }) {
  const toggleBuildings = document.getElementById('toggle-buildings');
  const toggleHazard = document.getElementById('toggle-hazard');
  const toggleSubsidence = document.getElementById('toggle-subsidence');
  const toggleSaline = document.getElementById('toggle-saline');
  const toggleDrainage = document.getElementById('toggle-drainage');
  const toggleWaste = document.getElementById('toggle-waste');
  const toggleWater = document.getElementById('toggle-water');

  if (toggleBuildings) {
    toggleBuildings.addEventListener('change', (e) => {
      buildingsLayer.setVisibility(e.target.checked);
    });
  }

  if (toggleHazard) {
    toggleHazard.addEventListener('change', (e) => {
      hazardLayer.toggleLayer('hazard', e.target.checked);
    });
  }

  if (toggleSubsidence) {
    toggleSubsidence.addEventListener('change', (e) => {
      hazardLayer.toggleLayer('subsidence', e.target.checked);
    });
  }

  if (toggleSaline) {
    toggleSaline.addEventListener('change', (e) => {
      hazardLayer.toggleLayer('saline', e.target.checked);
    });
  }

  if (toggleDrainage) {
    toggleDrainage.addEventListener('change', (e) => {
      hazardLayer.toggleLayer('drainage', e.target.checked);
    });
  }

  if (toggleWaste) {
    toggleWaste.addEventListener('change', (e) => {
      hazardLayer.toggleLayer('waste', e.target.checked);
    });
  }

  if (toggleWater) {
    toggleWater.addEventListener('change', (e) => {
      waterLayer.setVisibility(e.target.checked);
    });
  }
}
