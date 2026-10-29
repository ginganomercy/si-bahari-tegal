/**
 * @file buildings.layer.js
 * @description Manages 3D Building Extrusions with dynamic flood impact coloring.
 */

import { RISK_COLOR_PALETTE, WEBGL_CONFIG, POLDER_PUMP_CONFIG } from '../config/map.constants.js';

export class BuildingsLayer {
  /**
   * @param {maplibregl.Map} map
   */
  constructor(map) {
    this.map = map;
    this.sourceId = 'buildings-source';
    this.layerId = 'buildings-3d-extrusion';
    this.buildingsData = null;
  }

  /**
   * Loads building GeoJSON and binds 3D fill-extrusion layer
   * @param {string} geojsonUrl
   * @returns {Promise<number>} Total number of buildings loaded
   */
  async init(geojsonUrl) {
    try {
      const response = await fetch(geojsonUrl);
      if (!response.ok) {
        throw new Error(`Failed to load buildings data: ${response.status} ${response.statusText}`);
      }
      this.buildingsData = await response.json();

      this.map.addSource(this.sourceId, {
        type: 'geojson',
        data: this.buildingsData
      });

      this.map.addLayer({
        id: this.layerId,
        type: 'fill-extrusion',
        source: this.sourceId,
        minzoom: 13,
        paint: {
          'fill-extrusion-color': [
            'case',
            ['boolean', ['feature-state', 'submerged'], false],
            RISK_COLOR_PALETTE.BUILDING_AFFECTED,
            RISK_COLOR_PALETTE.BUILDING_DEFAULT
          ],
          'fill-extrusion-height': [
            'coalesce',
            ['get', 'height_m'],
            WEBGL_CONFIG.BUILDING_BASE_HEIGHT_M
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.9,
          'fill-extrusion-vertical-gradient': true
        }
      });

      return this.buildingsData.features.length;
    } catch (err) {
      console.error('[BuildingsLayer] Initialization error:', err);
      return 0;
    }
  }

  /**
   * Updates submerged feature-state of buildings relative to current water level and polder pump status
   * @param {number} waterElevationMeters
   * @param {boolean} [isPumpActive=true]
   * @returns {number} Count of submerged buildings
   */
  updateSubmerged(waterElevationMeters, isPumpActive = true) {
    if (!this.buildingsData || !this.map.getLayer(this.layerId)) {
      return 0;
    }

    let affectedCount = 0;
    const protectedKelurahans = POLDER_PUMP_CONFIG.PROTECTED_KELURAHAN_LIST;
    const polderThresholdM = POLDER_PUMP_CONFIG.PROTECTION_THRESHOLD_ELEVATION_M;

    for (const feat of this.buildingsData.features) {
      const kelurahan = feat.properties.kelurahan || '';
      const groundElev = feat.properties.ground_elevation_m || 1.5;
      
      // Civil engineering polder rule:
      // When pump is active and water level is below dyke crest (1.6m),
      // the retention basin pumps out water, protecting Tegalsari & Muarareja.
      const isProtectedByPolder = isPumpActive &&
                                  protectedKelurahans.includes(kelurahan) &&
                                  waterElevationMeters <= polderThresholdM;

      const isSubmerged = !isProtectedByPolder && (groundElev <= waterElevationMeters);

      if (isSubmerged) {
        affectedCount++;
      }

      // Update MapLibre feature state for high-performance GPU re-coloring
      this.map.setFeatureState(
        { source: this.sourceId, id: feat.properties.id },
        { submerged: isSubmerged }
      );
    }

    return affectedCount;
  }

  /**
   * @param {boolean} visible
   */
  setVisibility(visible) {
    if (this.map.getLayer(this.layerId)) {
      this.map.setLayoutProperty(
        this.layerId,
        'visibility',
        visible ? 'visible' : 'none'
      );
    }
  }
}

