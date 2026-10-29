/**
 * @file simulation.controller.js
 * @description Coordinates water level simulation, polder pump mitigations,
 * and fast disaster scenarios with RAF batching and pure SVG icons.
 */

import { WATER_SIMULATION_CONFIG, POLDER_PUMP_CONFIG, DISASTER_SCENARIOS } from '../config/map.constants.js';

export class SimulationController {
  /**
   * @param {Object} options
   * @param {import('../layers/water.shader.js').WaterSimulationLayer} options.waterLayer
   * @param {import('../layers/buildings.layer.js').BuildingsLayer} options.buildingsLayer
   * @param {import('../layers/hazard.layer.js').HazardLayer} options.hazardLayer
   */
  constructor({ waterLayer, buildingsLayer, hazardLayer }) {
    this.waterLayer = waterLayer;
    this.buildingsLayer = buildingsLayer;
    this.hazardLayer = hazardLayer;

    // Simulation state
    this.isPumpActive = true;
    this.currentScenarioId = null;

    // DOM References
    this.slider = document.getElementById('water-slider');
    this.elevationDisplay = document.getElementById('elevation-val');
    this.submergedBuildingsDisplay = document.getElementById('metric-submerged-buildings');
    this.inundatedKelurahansDisplay = document.getElementById('metric-affected-kelurahans');
    this.alertBadge = document.getElementById('alert-status-badge');
    this.btnAutoPlay = document.getElementById('btn-auto-play');

    // Polder Pump & Scenario DOM references
    this.togglePump = document.getElementById('toggle-polder-pump');
    this.pumpStatusBadge = document.getElementById('pump-status-badge');
    this.pumpCapacityNote = document.getElementById('pump-capacity-note');
    this.scenarioButtons = document.querySelectorAll('.btn-scenario-preset');

    // RAF batching flags
    this.rafPending = false;
    this.pendingElevation = WATER_SIMULATION_CONFIG.DEFAULT_ELEVATION_M;

    // Auto-play state
    this.isPlaying = false;
    this.playDirection = 1;
    this.playInterval = null;
  }

  init() {
    if (!this.slider) return;

    this.slider.min = WATER_SIMULATION_CONFIG.MIN_ELEVATION_M;
    this.slider.max = WATER_SIMULATION_CONFIG.MAX_ELEVATION_M;
    this.slider.step = WATER_SIMULATION_CONFIG.STEP_INCREMENT_M;
    this.slider.value = WATER_SIMULATION_CONFIG.DEFAULT_ELEVATION_M;

    // Slider input event
    this.slider.addEventListener('input', (e) => {
      if (this.isPlaying) this.stopAutoPlay();
      this.currentScenarioId = null;
      this._updateScenarioButtonsActive(null);
      const targetMeters = parseFloat(e.target.value);
      this.requestElevationUpdate(targetMeters);
    });

    // Auto-play button
    if (this.btnAutoPlay) {
      this.btnAutoPlay.addEventListener('click', () => {
        this.toggleAutoPlay();
      });
    }

    // Polder Pump switch
    if (this.togglePump) {
      this.togglePump.addEventListener('change', (e) => {
        this.setPumpStatus(e.target.checked);
      });
    }

    // Scenario preset buttons
    if (this.scenarioButtons && this.scenarioButtons.length > 0) {
      this.scenarioButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const scenarioKey = btn.getAttribute('data-scenario');
          if (scenarioKey) {
            this.applyScenario(scenarioKey);
          }
        });
      });
    }

    // Initial render
    this.setPumpStatus(true);
    this.onElevationChange(WATER_SIMULATION_CONFIG.DEFAULT_ELEVATION_M);
  }

  /**
   * Sets Polder Pump Station operational state
   * @param {boolean} isActive
   */
  setPumpStatus(isActive) {
    this.isPumpActive = Boolean(isActive);

    if (this.togglePump && this.togglePump.checked !== this.isPumpActive) {
      this.togglePump.checked = this.isPumpActive;
    }

    if (this.pumpStatusBadge) {
      if (this.isPumpActive) {
        this.pumpStatusBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-sm';
        this.pumpStatusBadge.innerHTML = `
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>AKTIF (3x 500 L/s)</span>
        `;
      } else {
        this.pumpStatusBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-sm';
        this.pumpStatusBadge.innerHTML = `
          <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          <span>GAGAL: MATI TOTAL</span>
        `;
      }
    }

    if (this.pumpCapacityNote) {
      if (this.isPumpActive) {
        this.pumpCapacityNote.textContent = '3 Unit pompa submersible beroperasi penuh. Kolam retensi aktif membuang debit ke laut.';
      } else {
        this.pumpCapacityNote.textContent = 'Peringatan: Pompa polder padam / macet! Kolam retensi meluap ke permukiman Tegalsari.';
      }
    }

    // Immediately re-evaluate building inundation under new pump state
    this.onElevationChange(this.pendingElevation);
  }

  /**
   * Applies one of the fast disaster scenarios
   * @param {'SPRING_TIDE'|'EXTREME_RAIN'|'COMPOUND_FLOOD'} scenarioKey
   */
  applyScenario(scenarioKey) {
    const scenario = DISASTER_SCENARIOS[scenarioKey];
    if (!scenario) return;

    if (this.isPlaying) this.stopAutoPlay();

    this.currentScenarioId = scenarioKey;
    this._updateScenarioButtonsActive(scenarioKey);

    // Update pump status per scenario
    this.setPumpStatus(scenario.pumpActive);

    // Update slider position and trigger recalculation
    if (this.slider) {
      this.slider.value = scenario.elevationMeters.toFixed(1);
    }
    this.requestElevationUpdate(scenario.elevationMeters);

    console.log(`[SimulationController] Scenario applied: ${scenario.name} (Elev: ${scenario.elevationMeters}m, Pump: ${scenario.pumpActive})`);
  }

  _updateScenarioButtonsActive(activeKey) {
    if (!this.scenarioButtons) return;

    this.scenarioButtons.forEach(btn => {
      const key = btn.getAttribute('data-scenario');
      if (key === activeKey) {
        btn.classList.add('bg-sky-50', 'text-sky-700', 'border-sky-300', 'shadow-sm', 'font-bold');
        btn.classList.remove('bg-white', 'text-slate-600', 'border-slate-200');
      } else {
        btn.classList.remove('bg-sky-50', 'text-sky-700', 'border-sky-300', 'shadow-sm', 'font-bold');
        btn.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
      }
    });
  }

  requestElevationUpdate(elevationMeters) {
    this.pendingElevation = elevationMeters;
    if (this.rafPending) return;

    this.rafPending = true;
    requestAnimationFrame(() => {
      this.onElevationChange(this.pendingElevation);
      this.rafPending = false;
    });
  }

  toggleAutoPlay() {
    if (this.isPlaying) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  startAutoPlay() {
    this.isPlaying = true;
    if (this.btnAutoPlay) {
      this.btnAutoPlay.innerHTML = `
        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        <span>Jeda</span>
      `;
      this.btnAutoPlay.classList.add('bg-rose-50', 'text-rose-700', 'border-rose-300');
    }

    this.playInterval = setInterval(() => {
      let currentVal = parseFloat(this.slider.value);
      currentVal += this.playDirection * WATER_SIMULATION_CONFIG.AUTO_PLAY_STEP_M;

      if (currentVal >= WATER_SIMULATION_CONFIG.MAX_ELEVATION_M) {
        currentVal = WATER_SIMULATION_CONFIG.MAX_ELEVATION_M;
        this.playDirection = -1;
      } else if (currentVal <= WATER_SIMULATION_CONFIG.MIN_ELEVATION_M) {
        currentVal = WATER_SIMULATION_CONFIG.MIN_ELEVATION_M;
        this.playDirection = 1;
      }

      this.slider.value = currentVal.toFixed(2);
      this.requestElevationUpdate(currentVal);
    }, WATER_SIMULATION_CONFIG.AUTO_PLAY_INTERVAL_MS);
  }

  stopAutoPlay() {
    this.isPlaying = false;
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
    if (this.btnAutoPlay) {
      this.btnAutoPlay.innerHTML = `
        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <span>Putar</span>
      `;
      this.btnAutoPlay.classList.remove('bg-rose-50', 'text-rose-700', 'border-rose-300');
    }
  }

  onElevationChange(elevationMeters) {
    if (this.elevationDisplay) {
      this.elevationDisplay.textContent = `${elevationMeters.toFixed(1)} m`;
    }

    if (this.waterLayer) {
      this.waterLayer.setWaterElevation(elevationMeters);
    }

    let submergedCount = 0;
    if (this.buildingsLayer) {
      // Pass both elevation and pump status for civil engineering protection
      submergedCount = this.buildingsLayer.updateSubmerged(elevationMeters, this.isPumpActive);
      if (this.submergedBuildingsDisplay) {
        this.submergedBuildingsDisplay.textContent = submergedCount.toLocaleString('id-ID');
      }
    }

    if (this.hazardLayer && this.inundatedKelurahansDisplay) {
      const kelCount = this.hazardLayer.getInundatedKelurahanCount(elevationMeters);
      this.inundatedKelurahansDisplay.textContent = `${kelCount} Kelurahan`;
    }

    this._updateAlertBadge(elevationMeters);
  }

  _updateAlertBadge(elevationMeters) {
    if (!this.alertBadge) return;

    if (!this.isPumpActive && elevationMeters >= 1.0) {
      this.alertBadge.textContent = 'SIAGA I: POMPA GAGAL & ROB EKSTREM';
      this.alertBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-300 shadow-sm animate-pulse';
      return;
    }

    if (elevationMeters < 0.6) {
      this.alertBadge.textContent = 'AMAN: NORMAL';
      this.alertBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm';
    } else if (elevationMeters <= 1.0) {
      this.alertBadge.textContent = 'SIAGA III: PASANG ROB';
      this.alertBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 shadow-sm';
    } else if (elevationMeters <= WATER_SIMULATION_CONFIG.TIDAL_SPRING_HIGH_WATER_M) {
      this.alertBadge.textContent = 'SIAGA II: GENANGAN TINGGI';
      this.alertBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 border border-orange-200 shadow-sm';
    } else {
      this.alertBadge.textContent = 'SIAGA I: ROB EKSTREM';
      this.alertBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-300 shadow-sm animate-pulse';
    }
  }
}
