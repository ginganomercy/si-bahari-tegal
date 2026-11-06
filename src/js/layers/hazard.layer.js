/**
 * @file hazard.layer.js
 * @description Manages AHP spatial risk polygons, Map Text Labels, and Causal Multi-Hazard layers
 * (Land Subsidence, Saline Intrusion, Drainage Bottlenecks, and Solid Waste Choke Points).
 */

import { RISK_COLOR_PALETTE, CAUSAL_HAZARD_CONSTANTS } from '../config/map.constants.js';
import { SpatialDataService } from '../services/spatial-data.service.js';

/**
 * Calculates a single centroid Point FeatureCollection from Polygon or MultiPolygon features.
 * Guarantees MapLibre renders exactly ONE label per entity, completely eliminating
 * tile-boundary label duplication, cutoff text, and multi-tile polygon overlap.
 * @param {Object} geojson
 * @returns {Object} FeatureCollection of Point features
 */
function createCentroidPointCollection(geojson) {
  if (!geojson || !geojson.features) {
    return { type: 'FeatureCollection', features: [] };
  }

  const pointFeatures = geojson.features.map(feature => {
    const geom = feature.geometry;
    let coords = [0, 0];

    if (geom.type === 'Point') {
      coords = geom.coordinates;
    } else if (geom.type === 'Polygon') {
      const ring = geom.coordinates[0];
      let sumX = 0;
      let sumY = 0;
      const count = ring.length > 1 ? ring.length - 1 : ring.length;
      for (let i = 0; i < count; i++) {
        sumX += ring[i][0];
        sumY += ring[i][1];
      }
      coords = [sumX / count, sumY / count];
    } else if (geom.type === 'MultiPolygon') {
      let maxLen = 0;
      let targetRing = geom.coordinates[0][0];
      for (const poly of geom.coordinates) {
        if (poly[0].length > maxLen) {
          maxLen = poly[0].length;
          targetRing = poly[0];
        }
      }
      let sumX = 0;
      let sumY = 0;
      const count = targetRing.length > 1 ? targetRing.length - 1 : targetRing.length;
      for (let i = 0; i < count; i++) {
        sumX += targetRing[i][0];
        sumY += targetRing[i][1];
      }
      coords = [sumX / count, sumY / count];
    }

    return {
      type: 'Feature',
      id: feature.id || feature.properties?.id,
      properties: { ...feature.properties },
      geometry: {
        type: 'Point',
        coordinates: coords
      }
    };
  });

  return {
    type: 'FeatureCollection',
    features: pointFeatures
  };
}

export class HazardLayer {
  /**
   * @param {maplibregl.Map} map
   */
  constructor(map) {
    this.map = map;
    this.urbanRiskSourceId = 'urban-risk-source';
    this.urbanRiskLabelSourceId = 'urban-risk-label-source';
    this.guciRiskSourceId = 'guci-risk-source';
    this.guciRiskLabelSourceId = 'guci-risk-label-source';
    this.drainageSourceId = 'drainage-source';
    this.subsidenceSourceId = 'subsidence-source';
    this.subsidenceLabelSourceId = 'subsidence-label-source';
    this.salineSourceId = 'saline-source';
    this.salineLabelSourceId = 'saline-label-source';
    this.wasteSourceId = 'waste-source';

    this.urbanFeatures = [];
    this.subsidenceFeatures = [];
    this.salineFeatures = [];
    this.wasteFeatures = [];

    this.onFeatureInspectCallback = null;
  }

  /**
   * Registers callback when a feature is selected for technical inspection
   * @param {Function} callback
   */
  setOnInspect(callback) {
    this.onFeatureInspectCallback = callback;
  }

  /**
   * Initializes all hazard layers and labels
   * @param {Object} urls
   */
  async init(urls) {
    const promises = [
      this._loadUrbanRisk(urls.urbanRisk),
      this._loadGuciRisk(urls.guciRisk),
      this._loadDrainagePoints(urls.drainage)
    ];

    if (urls.subsidence) {
      promises.push(this._loadSubsidence(urls.subsidence));
    }
    if (urls.saline) {
      promises.push(this._loadSalineIntrusion(urls.saline));
    }
    if (urls.waste) {
      promises.push(this._loadWasteChokes(urls.waste));
    }

    await Promise.all(promises);
  }

  /**
   * 1. Kelurahan Urban Risk Polygons & High-Contrast Light Mode Labels
   * @private
   */
  async _loadUrbanRisk(url) {
    try {
      const data = await SpatialDataService.fetchGeoJson(url);
      this.urbanFeatures = data.features;

      this.map.addSource(this.urbanRiskSourceId, { type: 'geojson', data });
      this.map.addSource(this.urbanRiskLabelSourceId, {
        type: 'geojson',
        data: createCentroidPointCollection(data)
      });

      // Polygon Fill
      this.map.addLayer({
        id: 'urban-risk-fill',
        type: 'fill',
        source: this.urbanRiskSourceId,
        paint: {
          'fill-color': [
            'match',
            ['get', 'klasifikasi_risiko'],
            'TINGGI', RISK_COLOR_PALETTE.HIGH,
            'SEDANG', RISK_COLOR_PALETTE.MEDIUM,
            RISK_COLOR_PALETTE.LOW
          ],
          'fill-opacity': 0.35
        }
      });

      // Boundary Line
      this.map.addLayer({
        id: 'urban-risk-line',
        type: 'line',
        source: this.urbanRiskSourceId,
        paint: {
          'line-color': [
            'match',
            ['get', 'klasifikasi_risiko'],
            'TINGGI', '#b91c1c',
            'SEDANG', '#ca8a04',
            '#15803d'
          ],
          'line-width': 2.2
        }
      });

      // Crisp Daylight Map Label (Light Mode High-Contrast with Zoom-Responsive Micro-Format)
      this.map.addLayer({
        id: 'urban-risk-labels',
        type: 'symbol',
        source: this.urbanRiskLabelSourceId,
        minzoom: 12.2,
        layout: {
          'text-field': [
            'step',
            ['zoom'],
            ['get', 'nama_kelurahan'],
            14.2,
            [
              'concat',
              ['get', 'nama_kelurahan'],
              '\n',
              ['to-string', ['get', 'elevasi_rata_m']],
              ' mdpl'
            ]
          ],
          'text-font': ['Open Sans Semibold'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12.2, 10,
            15, 12.5
          ],
          'text-anchor': 'center',
          'text-allow-overlap': false,
          'text-ignore-placement': false,
          'symbol-avoid-edges': true,
          'text-variable-anchor': ['center', 'top', 'bottom'],
          'text-radial-offset': 0.5,
          'text-justify': 'center'
        },
        paint: {
          'text-color': '#0f172a', // Deep Slate-900 for high daylight contrast
          'text-halo-color': '#ffffff', // Solid white halo for satellite legibility
          'text-halo-width': 3.0,
          'text-halo-blur': 0.5
        }
      });

      // Interactive Click
      this.map.on('click', 'urban-risk-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (this.onFeatureInspectCallback) {
          this.onFeatureInspectCallback('KELURAHAN', props);
        }
      });
      this.map.on('mouseenter', 'urban-risk-fill', () => { this.map.getCanvas().style.cursor = 'pointer'; });
      this.map.on('mouseleave', 'urban-risk-fill', () => { this.map.getCanvas().style.cursor = ''; });

    } catch (err) {
      console.error('[HazardLayer] Error loading urban risk layer:', err);
    }
  }

  /**
   * 2. Hulu Guci Steep Watershed Risk
   * @private
   */
  async _loadGuciRisk(url) {
    try {
      const data = await SpatialDataService.fetchGeoJson(url);

      this.map.addSource(this.guciRiskSourceId, { type: 'geojson', data });
      this.map.addSource(this.guciRiskLabelSourceId, {
        type: 'geojson',
        data: createCentroidPointCollection(data)
      });

      this.map.addLayer({
        id: 'guci-risk-fill',
        type: 'fill',
        source: this.guciRiskSourceId,
        paint: {
          'fill-color': [
            'match',
            ['get', 'klasifikasi_risiko'],
            'TINGGI', '#ef4444',
            'SEDANG', '#f59e0b',
            '#ef4444'
          ],
          'fill-opacity': 0.22
        }
      });

      this.map.addLayer({
        id: 'guci-risk-line',
        type: 'line',
        source: this.guciRiskSourceId,
        paint: {
          'line-color': [
            'match',
            ['get', 'klasifikasi_risiko'],
            'TINGGI', '#dc2626',
            'SEDANG', '#d97706',
            '#dc2626'
          ],
          'line-width': 2.0,
          'line-dasharray': [3, 2]
        }
      });

      this.map.addLayer({
        id: 'guci-risk-labels',
        type: 'symbol',
        source: this.guciRiskLabelSourceId,
        minzoom: 11.5,
        layout: {
          'text-field': [
            'step',
            ['zoom'],
            ['concat', ['get', 'nama_desa'], ' (', ['to-string', ['get', 'elevasi_rata_m']], 'm)'],
            13.5,
            [
              'concat',
              ['get', 'nama_desa'],
              '\nElev: ',
              ['to-string', ['get', 'elevasi_rata_m']],
              ' mdpl (Slope ',
              ['to-string', ['get', 'kemiringan_lereng_derajat']],
              '°)'
            ]
          ],
          'text-font': ['Open Sans Semibold'],
          'text-size': 11.0,
          'text-anchor': 'center',
          'text-allow-overlap': false,
          'text-ignore-placement': false,
          'symbol-avoid-edges': true,
          'text-variable-anchor': ['center', 'top', 'bottom'],
          'text-radial-offset': 0.5,
          'text-justify': 'center'
        },
        paint: {
          'text-color': '#7f1d1d',
          'text-halo-color': '#ffffff',
          'text-halo-width': 3.0,
          'text-halo-blur': 0.5
        }
      });

      this.map.on('click', 'guci-risk-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (this.onFeatureInspectCallback) {
          this.onFeatureInspectCallback('GUCI', props);
        }
      });
      this.map.on('mouseenter', 'guci-risk-fill', () => { this.map.getCanvas().style.cursor = 'pointer'; });
      this.map.on('mouseleave', 'guci-risk-fill', () => { this.map.getCanvas().style.cursor = ''; });

    } catch (err) {
      console.error('[HazardLayer] Error loading Guci risk layer:', err);
    }
  }

  /**
   * 3. Drainage Bottleneck Critical Points
   * @private
   */
  async _loadDrainagePoints(url) {
    try {
      const data = await SpatialDataService.fetchGeoJson(url);

      this.map.addSource(this.drainageSourceId, { type: 'geojson', data });

      // Outer glow circle
      this.map.addLayer({
        id: 'drainage-points-glow',
        type: 'circle',
        source: this.drainageSourceId,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 7.5,
            15, 13
          ],
          'circle-color': [
            'case',
            ['>=', ['get', 'sediment_depth_cm'], 60.0],
            '#ef4444',
            '#f59e0b'
          ],
          'circle-opacity': 0.35
        }
      });

      // Core Point
      this.map.addLayer({
        id: 'drainage-points-core',
        type: 'circle',
        source: this.drainageSourceId,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 4.0,
            15, 6.5
          ],
          'circle-color': [
            'case',
            ['>=', ['get', 'sediment_depth_cm'], 60.0],
            '#dc2626',
            '#d97706'
          ],
          'circle-stroke-width': 2.0,
          'circle-stroke-color': '#ffffff'
        }
      });

      const handleDrainageClick = (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (this.onFeatureInspectCallback) {
          this.onFeatureInspectCallback('DRAINAGE', props);
        }
      };
      this.map.on('click', 'drainage-points-core', handleDrainageClick);
      this.map.on('click', 'drainage-points-glow', handleDrainageClick);
      this.map.on('mouseenter', 'drainage-points-core', () => { this.map.getCanvas().style.cursor = 'pointer'; });
      this.map.on('mouseleave', 'drainage-points-core', () => { this.map.getCanvas().style.cursor = ''; });

    } catch (err) {
      console.error('[HazardLayer] Error loading drainage points:', err);
    }
  }

  /**
   * 4. Land Subsidence Causal Layer (Penurunan Tanah 2.5–5.2 cm/th)
   * @private
   */
  async _loadSubsidence(url) {
    try {
      const data = await SpatialDataService.fetchGeoJson(url);
      this.subsidenceFeatures = data.features;

      this.map.addSource(this.subsidenceSourceId, { type: 'geojson', data });
      this.map.addSource(this.subsidenceLabelSourceId, {
        type: 'geojson',
        data: createCentroidPointCollection(data)
      });

      // Fill Layer (Initially off for clean initial view)
      this.map.addLayer({
        id: 'subsidence-fill',
        type: 'fill',
        source: this.subsidenceSourceId,
        layout: {
          'visibility': 'none'
        },
        paint: {
          'fill-color': CAUSAL_HAZARD_CONSTANTS.LAND_SUBSIDENCE.COLOR_FILL,
          'fill-opacity': 0.28
        }
      });

      // Dashed Line Boundary
      this.map.addLayer({
        id: 'subsidence-line',
        type: 'line',
        source: this.subsidenceSourceId,
        layout: {
          'visibility': 'none'
        },
        paint: {
          'line-color': CAUSAL_HAZARD_CONSTANTS.LAND_SUBSIDENCE.COLOR_BORDER,
          'line-width': 2.5,
          'line-dasharray': [3, 2]
        }
      });

      // Subsidence Label (Strict Anti-Overlap via Zoom-Responsive Micro-Format)
      this.map.addLayer({
        id: 'subsidence-labels',
        type: 'symbol',
        source: this.subsidenceLabelSourceId,
        minzoom: 12.5,
        layout: {
          'visibility': 'none',
          'text-field': [
            'step',
            ['zoom'],
            ['concat', 'Amblesan: ', ['to-string', ['get', 'laju_penurunan_cm_tahun']], ' cm/th'],
            14.5,
            [
              'concat',
              'Amblesan: ',
              ['get', 'nama_zona'],
              '\nLaju: ',
              ['to-string', ['get', 'laju_penurunan_cm_tahun']],
              ' cm/th'
            ]
          ],
          'text-font': ['Open Sans Semibold'],
          'text-size': 10.5,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-allow-overlap': false,
          'text-ignore-placement': false,
          'symbol-avoid-edges': true,
          'text-variable-anchor': ['top', 'bottom'],
          'text-radial-offset': 0.5,
          'text-justify': 'center'
        },
        paint: {
          'text-color': '#581c87',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2.5
        }
      });

      this.map.on('click', 'subsidence-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (this.onFeatureInspectCallback) {
          this.onFeatureInspectCallback('SUBSIDENCE', props);
        }
      });

    } catch (err) {
      console.error('[HazardLayer] Error loading subsidence layer:', err);
    }
  }

  /**
   * 5. Saline Water Intrusion Causal Layer (1.5 km Coastal Buffer)
   * @private
   */
  async _loadSalineIntrusion(url) {
    try {
      const data = await SpatialDataService.fetchGeoJson(url);
      this.salineFeatures = data.features;

      this.map.addSource(this.salineSourceId, { type: 'geojson', data });
      this.map.addSource(this.salineLabelSourceId, {
        type: 'geojson',
        data: createCentroidPointCollection(data)
      });

      // Translucent Amber Buffer Fill (Initially off for clean initial view)
      this.map.addLayer({
        id: 'saline-fill',
        type: 'fill',
        source: this.salineSourceId,
        layout: {
          'visibility': 'none'
        },
        paint: {
          'fill-color': CAUSAL_HAZARD_CONSTANTS.SALINE_INTRUSION.COLOR_FILL,
          'fill-opacity': 0.22
        }
      });

      // Line
      this.map.addLayer({
        id: 'saline-line',
        type: 'line',
        source: this.salineSourceId,
        layout: {
          'visibility': 'none'
        },
        paint: {
          'line-color': CAUSAL_HAZARD_CONSTANTS.SALINE_INTRUSION.COLOR_BORDER,
          'line-width': 2.2,
          'line-dasharray': [4, 2]
        }
      });

      // Label (Strict Anti-Overlap via Zoom-Responsive Micro-Format)
      this.map.addLayer({
        id: 'saline-labels',
        type: 'symbol',
        source: this.salineLabelSourceId,
        minzoom: 12.5,
        layout: {
          'visibility': 'none',
          'text-field': [
            'step',
            ['zoom'],
            ['concat', 'Intrusi Asin: ', ['to-string', ['get', 'salinitas_air_tanah_ppt']], ' ppt'],
            14.5,
            [
              'concat',
              ['get', 'nama_zona'],
              '\nSalinitas: ',
              ['to-string', ['get', 'salinitas_air_tanah_ppt']],
              ' ppt'
            ]
          ],
          'text-font': ['Open Sans Semibold'],
          'text-size': 10.5,
          'text-offset': [0, -1.2],
          'text-anchor': 'bottom',
          'text-allow-overlap': false,
          'text-ignore-placement': false,
          'symbol-avoid-edges': true,
          'text-variable-anchor': ['bottom', 'top'],
          'text-radial-offset': 0.5,
          'text-justify': 'center'
        },
        paint: {
          'text-color': '#78350f',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2.5
        }
      });

      this.map.on('click', 'saline-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (this.onFeatureInspectCallback) {
          this.onFeatureInspectCallback('SALINE', props);
        }
      });

    } catch (err) {
      console.error('[HazardLayer] Error loading saline intrusion layer:', err);
    }
  }

  /**
   * 6. Solid Waste Choke Points (Tumpukan Sampah Saluran)
   * @private
   */
  async _loadWasteChokes(url) {
    try {
      const data = await SpatialDataService.fetchGeoJson(url);
      this.wasteFeatures = data.features;

      this.map.addSource(this.wasteSourceId, { type: 'geojson', data });

      // Outer glow
      this.map.addLayer({
        id: 'waste-points-glow',
        type: 'circle',
        source: this.wasteSourceId,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 7.5,
            15, 13
          ],
          'circle-color': CAUSAL_HAZARD_CONSTANTS.SOLID_WASTE_BOTTLENECKS.COLOR_MARKER,
          'circle-opacity': 0.35
        }
      });

      // Core point
      this.map.addLayer({
        id: 'waste-points-core',
        type: 'circle',
        source: this.wasteSourceId,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 4.0,
            15, 6.5
          ],
          'circle-color': '#c2410c',
          'circle-stroke-width': 2.0,
          'circle-stroke-color': '#ffffff'
        }
      });

      const handleWasteClick = (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (this.onFeatureInspectCallback) {
          this.onFeatureInspectCallback('WASTE', props);
        }
      };
      this.map.on('click', 'waste-points-core', handleWasteClick);
      this.map.on('click', 'waste-points-glow', handleWasteClick);
      this.map.on('mouseenter', 'waste-points-core', () => { this.map.getCanvas().style.cursor = 'pointer'; });
      this.map.on('mouseleave', 'waste-points-core', () => { this.map.getCanvas().style.cursor = ''; });

    } catch (err) {
      console.error('[HazardLayer] Error loading waste chokes layer:', err);
    }
  }

  getInundatedKelurahanCount(waterElevationMeters) {
    if (!this.urbanFeatures || this.urbanFeatures.length === 0) return 0;
    return this.urbanFeatures.filter(f => f.properties.elevasi_rata_m <= waterElevationMeters).length;
  }

  /**
   * Toggles layer groups visibility dynamically
   * @param {'hazard'|'drainage'|'subsidence'|'saline'|'waste'} group
   * @param {boolean} visible
   */
  toggleLayer(group, visible) {
    const val = visible ? 'visible' : 'none';
    const layerMap = {
      hazard: [
        'urban-risk-fill', 'urban-risk-line', 'urban-risk-labels',
        'guci-risk-fill', 'guci-risk-line', 'guci-risk-labels'
      ],
      drainage: ['drainage-points-glow', 'drainage-points-core'],
      subsidence: ['subsidence-fill', 'subsidence-line', 'subsidence-labels'],
      saline: ['saline-fill', 'saline-line', 'saline-labels'],
      waste: ['waste-points-glow', 'waste-points-core']
    };

    const targetLayers = layerMap[group] || [];
    targetLayers.forEach(id => {
      if (this.map.getLayer(id)) {
        this.map.setLayoutProperty(id, 'visibility', val);
      }
    });
  }
}
