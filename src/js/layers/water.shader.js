/**
 * @file water.shader.js
 * @description High-performance Native MapLibre GPU Hydro-Inundation Layer.
 * Calibrated so that at 0.0m elevation, inland is 100% dry with zero blue overlay artifacts.
 */

import { RISK_COLOR_PALETTE } from '../config/map.constants.js';

export class WaterSimulationLayer {
  /**
   * @param {maplibregl.Map} map
   */
  constructor(map) {
    this.map = map;
    this.sourceId = 'coastal-water-basin-source';
    this.layerId = 'coastal-water-inundation-layer';
    this.currentElevationMeters = 0.0;
    this.visible = true;
  }

  /**
   * Binds GPU water bathymetric surface to MapLibre
   */
  init() {
    if (this.map.getSource(this.sourceId)) return;

    // Organic coastal polygon encompassing Tegal coastline, ports, and river estuaries
    const coastalBasinPolygon = {
      type: 'Feature',
      properties: {
        name: 'Cekungan Pesisir & Estuari Kota Tegal'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [109.060, -6.820],
          [109.110, -6.832],
          [109.138, -6.838],
          [109.175, -6.840],
          [109.175, -6.868],
          [109.145, -6.878],
          [109.115, -6.885],
          [109.075, -6.875],
          [109.060, -6.820]
        ]]
      }
    };

    this.map.addSource(this.sourceId, {
      type: 'geojson',
      data: coastalBasinPolygon
    });

    // 3D Hydraulic Inundation Extrusion (Starts at 0.0m with opacity 0)
    this.map.addLayer({
      id: this.layerId,
      type: 'fill-extrusion',
      source: this.sourceId,
      paint: {
        'fill-extrusion-color': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, '#0369a1',
          14, RISK_COLOR_PALETTE.WATER_SURFACE,
          17, '#38bdf8'
        ],
        'fill-extrusion-height': this.currentElevationMeters,
        'fill-extrusion-base': 0,
        // Opacity is 0 at 0.0m elevation, scaling smoothly as water rises
        'fill-extrusion-opacity': 0.0,
        'fill-extrusion-vertical-gradient': true
      }
    });

    console.log('[WaterSimulationLayer] Clean water layer initialized (0.0m dry baseline).');
  }

  /**
   * Updates water elevation on the GPU instantly.
   * If elevation <= 0.0m, opacity is 0.0 (completely clear and dry).
   * @param {number} elevationMeters
   */
  setWaterElevation(elevationMeters) {
    this.currentElevationMeters = elevationMeters;

    if (!this.map.getLayer(this.layerId)) return;

    if (elevationMeters <= 0.02) {
      // Completely dry land at 0m
      this.map.setPaintProperty(this.layerId, 'fill-extrusion-height', 0.0);
      this.map.setPaintProperty(this.layerId, 'fill-extrusion-opacity', 0.0);
    } else {
      // Dynamic rising water with natural depth opacity
      const dynamicOpacity = Math.min(0.75, 0.45 + (elevationMeters / 2.5) * 0.3);
      this.map.setPaintProperty(this.layerId, 'fill-extrusion-height', elevationMeters);
      this.map.setPaintProperty(this.layerId, 'fill-extrusion-opacity', dynamicOpacity);
    }
  }

  /**
   * @param {boolean} visible
   */
  setVisibility(visible) {
    this.visible = visible;
    const val = visible ? 'visible' : 'none';

    if (this.map.getLayer(this.layerId)) {
      this.map.setLayoutProperty(this.layerId, 'visibility', val);
    }
  }
}
