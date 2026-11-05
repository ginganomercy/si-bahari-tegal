/**
 * @file main.js
 * @description Master Application Coordinator for SI-BAHARI 3D Digital Twin Kota Tegal.
 * Orchestrates spatial layers, controllers, view components, and application lifecycle.
 */

import { TerrainManager } from './layers/terrain.layer.js';
import { CameraController } from './controllers/camera.controller.js';
import { BuildingsLayer } from './layers/buildings.layer.js';
import { HazardLayer } from './layers/hazard.layer.js';
import { WaterSimulationLayer } from './layers/water.shader.js';
import { SimulationController } from './controllers/simulation.controller.js';
import { LandingComponent } from './components/landing/landing.component.js';
import { TutorialComponent } from './components/tutorial/tutorial.component.js';
import { InspectorComponent } from './components/inspector/inspector.component.js';
import { DrainageListComponent } from './components/drainage/drainage-list.component.js';
import { KelurahanTableComponent } from './components/analytics/kelurahan-table.component.js';
import { SpatialDataService } from './services/spatial-data.service.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[SI-BAHARI 3D] Initializing Enterprise Application Shell...');

  let simulationControllerInstance = null;

  try {
    // 1. Initialize Map & Cinematic Camera
    const map = TerrainManager.createMap('map');
    const cameraController = new CameraController(map);

    // 2. Initialize Slide-Over Technical Inspector Component
    const inspectorComponent = new InspectorComponent();
    inspectorComponent.init();

    // 3. Initialize Interactive Walkthrough Tutorial Component
    const tutorialComponent = new TutorialComponent({
      cameraController,
      onComplete: () => console.log('[SI-BAHARI 3D] Walkthrough tour completed.')
    });

    // 4. Initialize Executive Landing Page Portal
    const landingComponent = new LandingComponent({
      onExplore: () => cameraController.flyToZone('KOTA_TEGAL'),
      onQuickScenario: (scenarioKey) => {
        cameraController.flyToZone('KOTA_TEGAL');
        if (simulationControllerInstance) {
          simulationControllerInstance.applyScenario(scenarioKey);
        }
      },
      onStartTutorial: () => tutorialComponent.start()
    });
    landingComponent.init();

    // 5. Initialize View Components for Tab 3 & Tab 4
    const drainageListComponent = new DrainageListComponent({
      onSelectDrainage: (props, coords) => {
        if (coords) cameraController.flyToSpot(coords, 16.5, 55.0);
        inspectorComponent.open('DRAINAGE', props);
      },
      onSelectWaste: (props, coords) => {
        if (coords) cameraController.flyToSpot(coords, 16.5, 55.0);
        inspectorComponent.open('WASTE', props);
      }
    });
    drainageListComponent.init();

    const kelurahanTableComponent = new KelurahanTableComponent({
      onSelectKelurahan: (props, coords) => {
        if (coords) cameraController.flyToSpot(coords, 15.0, 45.0);
        inspectorComponent.open('KELURAHAN', props);
      }
    });
    kelurahanTableComponent.init();

    // 6. Setup Top Bar Controls & Drawer Navigation
    _setupHeaderControls(map, cameraController, landingComponent, tutorialComponent);
    _setupDrawerTabs();

    // 7. Map Load Event: Bind Spatial Layers, Datasets, and Controllers
    map.on('load', async () => {
      console.log('[SI-BAHARI 3D] Map surface loaded. Binding spatial layers...');

      const buildingsLayer = new BuildingsLayer(map);
      const hazardLayer = new HazardLayer(map);
      const waterLayer = new WaterSimulationLayer(map);
      waterLayer.init();

      const dataUrls = SpatialDataService.getDataUrls();

      // Load spatial layers concurrently with fail-safe settlement
      await Promise.allSettled([
        buildingsLayer.init(dataUrls.buildings),
        hazardLayer.init(dataUrls)
      ]);

      // Connect map feature clicks to inspector drawer
      hazardLayer.setOnInspect((type, props) => {
        inspectorComponent.open(type, props);
      });

      // Initialize Simulation Controller with RAF batching
      simulationControllerInstance = new SimulationController({
        waterLayer,
        buildingsLayer,
        hazardLayer
      });
      simulationControllerInstance.init();

      // Populate Tab 3 & Tab 4 data asynchronously
      _populateViewData(dataUrls, drainageListComponent, kelurahanTableComponent);

      // Setup Layer Visibility Toggles in Tab 2
      _setupLayerToggles({ buildingsLayer, hazardLayer, waterLayer });

      // Wire Polder Pump Inspector Trigger
      _setupPolderInspectorButton(cameraController, inspectorComponent, () => simulationControllerInstance?.isPumpActive);

      // Final viewport recalibration
      map.resize();

      console.log('[SI-BAHARI 3D] System operational at 60 FPS.');
    });

  } catch (err) {
    console.error('[SI-BAHARI 3D] Bootstrap error:', err);
  }
});

/**
 * Asynchronously populates Tab 3 & Tab 4 views via SpatialDataService
 * @private
 */
async function _populateViewData(dataUrls, drainageListComp, kelurahanTableComp) {
  try {
    const [drainageData, wasteData, urbanRiskData] = await Promise.all([
      SpatialDataService.fetchGeoJson(dataUrls.drainage),
      SpatialDataService.fetchGeoJson(dataUrls.waste),
      SpatialDataService.fetchGeoJson(dataUrls.urbanRisk)
    ]);

    if (drainageData?.features) drainageListComp.renderDrainage(drainageData.features);
    if (wasteData?.features) drainageListComp.renderWaste(wasteData.features);
    if (urbanRiskData?.features) kelurahanTableComp.render(urbanRiskData.features);
  } catch (err) {
    console.error('[SI-BAHARI 3D] Error populating view data:', err);
  }
}

/**
 * Setup Top Application Bar Controls
 * @private
 */
function _setupHeaderControls(map, cameraController, landingComponent, tutorialComponent) {
  const btnOpenTutorial = document.getElementById('btn-open-tutorial');
  if (btnOpenTutorial) {
    btnOpenTutorial.addEventListener('click', () => {
      if (landingComponent?.isVisible()) landingComponent.hide();
      tutorialComponent.start();
    });
  }

  const btnOpenGuide = document.getElementById('btn-open-guide');
  if (btnOpenGuide) {
    btnOpenGuide.addEventListener('click', () => {
      if (tutorialComponent?.isActive) tutorialComponent.stop();
      landingComponent.show();
    });
  }

  const btnToggleDrawer = document.getElementById('btn-toggle-drawer');
  const drawer = document.getElementById('app-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');

  const toggleDrawer = (forceOpen) => {
    if (!drawer) return;
    const isClosed = drawer.classList.contains('-translate-x-full');
    const shouldOpen = forceOpen !== undefined ? forceOpen : isClosed;
    if (shouldOpen) {
      drawer.classList.remove('-translate-x-full');
      if (drawerBackdrop) drawerBackdrop.classList.remove('hidden');
    } else {
      drawer.classList.add('-translate-x-full');
      if (drawerBackdrop) drawerBackdrop.classList.add('hidden');
    }
  };

  if (btnToggleDrawer) {
    btnToggleDrawer.addEventListener('click', () => toggleDrawer());
  }
  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', () => toggleDrawer(false));
  }

  // Zone Switchers (Synchronized Desktop & Mobile)
  const btnTegal = document.getElementById('btn-zone-tegal');
  const btnGuci = document.getElementById('btn-zone-guci');
  const btnTegalMobile = document.getElementById('btn-zone-tegal-mobile');
  const btnGuciMobile = document.getElementById('btn-zone-guci-mobile');
  const simDockWrapper = document.getElementById('simulation-dock-wrapper') || document.getElementById('panel-water-simulation') || document.querySelector('section.absolute.bottom-5');
  const panelCoastal = document.getElementById('panel-coastal-analytics');
  const panelGuci = document.getElementById('panel-guci-analytics');

  const activeZoneClass = 'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all text-sky-800 bg-white shadow-sm border border-slate-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0';
  const inactiveZoneClass = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0';

  const selectZone = (zoneKey) => {
    if (zoneKey === 'TEGAL') {
      if (btnTegal) btnTegal.className = activeZoneClass;
      if (btnGuci) btnGuci.className = inactiveZoneClass;
      if (btnTegalMobile) {
        btnTegalMobile.className = 'flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-sky-800 bg-white shadow-sm border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap';
      }
      if (btnGuciMobile) {
        btnGuciMobile.className = 'flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap';
      }
      cameraController.flyToZone('KOTA_TEGAL');
      if (simDockWrapper) simDockWrapper.style.display = 'flex';
      if (panelCoastal) {
        panelCoastal.classList.remove('hidden');
        panelCoastal.style.display = 'block';
      }
      if (panelGuci) {
        panelGuci.classList.add('hidden');
        panelGuci.style.display = 'none';
      }
      const chipZoneLabel = document.getElementById('chip-zone-label');
      if (chipZoneLabel) chipZoneLabel.textContent = '🏔️ Guci 3D';
    } else {
      if (btnGuci) btnGuci.className = activeZoneClass;
      if (btnTegal) btnTegal.className = inactiveZoneClass;
      if (btnGuciMobile) {
        btnGuciMobile.className = 'flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-sky-800 bg-white shadow-sm border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap';
      }
      if (btnTegalMobile) {
        btnTegalMobile.className = 'flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap';
      }
      cameraController.flyToZone('GUCI_BUMIJAWA');
      if (simDockWrapper) simDockWrapper.style.display = 'none';
      if (panelCoastal) {
        panelCoastal.classList.add('hidden');
        panelCoastal.style.display = 'none';
      }
      if (panelGuci) {
        panelGuci.classList.remove('hidden');
        panelGuci.style.display = 'block';
      }
      const chipZoneLabel = document.getElementById('chip-zone-label');
      if (chipZoneLabel) chipZoneLabel.textContent = '📍 Pesisir';
    }

    if (window.innerWidth < 768) {
      toggleDrawer(false);
    }
  };

  if (btnTegal) btnTegal.addEventListener('click', () => selectZone('TEGAL'));
  if (btnGuci) btnGuci.addEventListener('click', () => selectZone('GUCI'));
  if (btnTegalMobile) btnTegalMobile.addEventListener('click', () => selectZone('TEGAL'));
  if (btnGuciMobile) btnGuciMobile.addEventListener('click', () => selectZone('GUCI'));

  // Mobile Quick Action Scenario Chips Wiring
  const quickChips = document.querySelectorAll('.btn-quick-chip');
  quickChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const scenarioKey = chip.getAttribute('data-chip-scenario');
      const action = chip.getAttribute('data-chip-action');

      if (simulationControllerInstance) {
        simulationControllerInstance.triggerHaptic(15);
      }

      if (scenarioKey === 'RESET') {
        if (simulationControllerInstance) {
          simulationControllerInstance.setPumpStatus(true);
          if (simulationControllerInstance.slider) simulationControllerInstance.slider.value = '0.0';
          simulationControllerInstance.requestElevationUpdate(0.0);
        }
      } else if (scenarioKey) {
        if (simulationControllerInstance) {
          simulationControllerInstance.applyScenario(scenarioKey);
        }
      } else if (action === 'TOGGLE_PUMP') {
        if (simulationControllerInstance) {
          simulationControllerInstance.setPumpStatus(!simulationControllerInstance.isPumpActive);
        }
      }
    });
  });

  // Mobile Quick Zone Toggle Chip
  const btnChipZoneToggle = document.getElementById('btn-chip-zone-toggle');
  if (btnChipZoneToggle) {
    btnChipZoneToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCurrentlyGuci = cameraController.getActiveZone() === 'GUCI_BUMIJAWA';
      selectZone(isCurrentlyGuci ? 'TEGAL' : 'GUCI');
    });
  }

  const selectBasemap = document.getElementById('select-basemap');
  if (selectBasemap) {
    selectBasemap.addEventListener('change', (e) => TerrainManager.switchBasemap(map, e.target.value));
  }

  // 3D Terrain on/off toggle for ultra-smooth 60 FPS performance
  const btnToggleTerrain = document.getElementById('btn-toggle-terrain');
  const labelTerrainStatus = document.getElementById('label-terrain-status');
  let isTerrainEnabled = true;

  if (btnToggleTerrain && labelTerrainStatus) {
    btnToggleTerrain.addEventListener('click', () => {
      isTerrainEnabled = !isTerrainEnabled;
      TerrainManager.toggleTerrain(map, isTerrainEnabled);
      if (isTerrainEnabled) {
        labelTerrainStatus.textContent = '3D Aktif';
        btnToggleTerrain.className = 'px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100';
      } else {
        labelTerrainStatus.textContent = 'Mode 2D';
        btnToggleTerrain.className = 'px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200';
      }
    });
  }

  const btnResetNorth = document.getElementById('btn-reset-north');
  if (btnResetNorth) {
    btnResetNorth.addEventListener('click', () => cameraController.resetNorth());
  }

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
 * Handles Tab Navigation in Left Drawer
 * @private
 */
function _setupDrawerTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => {
        b.className = 'tab-btn flex-1 py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 border-b-2 border-transparent flex flex-col items-center gap-1.5 transition-all';
      });
      btn.className = 'tab-btn active flex-1 py-3 text-xs font-bold text-sky-600 border-b-2 border-sky-600 bg-white flex flex-col items-center gap-1.5 transition-all';

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
 * Wires Multi-Hazard Causal Layer Switches in Tab 2
 * @private
 */
function _setupLayerToggles({ buildingsLayer, hazardLayer, waterLayer }) {
  const toggleMap = [
    { id: 'toggle-buildings', handler: (checked) => buildingsLayer.setVisibility(checked) },
    { id: 'toggle-hazard', handler: (checked) => hazardLayer.toggleLayer('hazard', checked) },
    { id: 'toggle-subsidence', handler: (checked) => hazardLayer.toggleLayer('subsidence', checked) },
    { id: 'toggle-saline', handler: (checked) => hazardLayer.toggleLayer('saline', checked) },
    { id: 'toggle-drainage', handler: (checked) => hazardLayer.toggleLayer('drainage', checked) },
    { id: 'toggle-waste', handler: (checked) => hazardLayer.toggleLayer('waste', checked) },
    { id: 'toggle-water', handler: (checked) => waterLayer.setVisibility(checked) }
  ];

  toggleMap.forEach(({ id, handler }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', (e) => handler(e.target.checked));
    }
  });
}

/**
 * Wires Stasiun Pompa Polder Tegalsari Inspection Button
 * @private
 */
function _setupPolderInspectorButton(cameraController, inspectorComponent, getPumpStatus) {
  const btnInspectPolder = document.getElementById('btn-inspect-polder');
  if (!btnInspectPolder) return;

  btnInspectPolder.addEventListener('click', () => {
    cameraController.flyToSpot([109.1350, -6.8530], 16.0, 50.0);
    const isPumpActive = getPumpStatus();

    inspectorComponent.open('POLDER', {
      name: 'Stasiun Pompa Polder Kolam Retensi Tegalsari',
      catchment_area: 'Tegalsari RW 01–07 & Muarareja Pesisir (185.4 Ha)',
      pump_units: '3 Unit Pompa Submersible Axial Flow (3x 500 L/s)',
      total_capacity_debit: '1.500 Liter/detik (5.400 m³/jam)',
      retention_pond_volume: '45.000 m³ (Kolam Retensi Utama)',
      dyke_crest_level: '+1.60 mdpl (Elevasi Puncak Tanggul Keliling)',
      backup_power: 'Automatic Genset Diesel Silent 250 kVA (Siaga 24 Jam)',
      operational_agency: 'DPUPR Kota Tegal & BBWS Pemali-Juana',
      current_status: isPumpActive ? 'AKTIF BEROPERASI' : 'GAGAL / MATI TOTAL',
      is_active: isPumpActive
    });
  });
}

// Register PWA ServiceWorker for Offline Emergency Disaster Resilience
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then((reg) => console.log('[PWA] ServiceWorker active with scope:', reg.scope))
      .catch((err) => console.warn('[PWA] ServiceWorker registration notice:', err?.message || err));
  });
}
