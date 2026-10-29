/**
 * @file hazard.layer.js
 * @description Manages AHP spatial risk polygons, Map Text Labels, and Causal Multi-Hazard layers
 * (Land Subsidence, Saline Intrusion, Drainage Bottlenecks, and Solid Waste Choke Points).
 */

import { RISK_COLOR_PALETTE, CAUSAL_HAZARD_CONSTANTS } from '../config/map.constants.js';

export class HazardLayer {
  /**
   * @param {maplibregl.Map} map
   */
  constructor(map) {
    this.map = map;
    this.urbanRiskSourceId = 'urban-risk-source';
    this.guciRiskSourceId = 'guci-risk-source';
    this.drainageSourceId = 'drainage-source';
    this.subsidenceSourceId = 'subsidence-source';
    this.salineSourceId = 'saline-source';
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
      const res = await fetch(url);
      const data = await res.json();
      this.urbanFeatures = data.features;

      this.map.addSource(this.urbanRiskSourceId, { type: 'geojson', data });

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

      // Crisp Daylight Map Label (Light Mode High-Contrast)
      this.map.addLayer({
        id: 'urban-risk-labels',
        type: 'symbol',
        source: this.urbanRiskSourceId,
        minzoom: 12,
        layout: {
          'text-field': [
            'concat',
            ['get', 'nama_kelurahan'],
            '\n',
            ['to-string', ['get', 'elevasi_rata_m']],
            ' mdpl'
          ],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 10.5,
            15, 13
          ],
          'text-anchor': 'center',
          'text-allow-overlap': false,
          'text-ignore-placement': false
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

      this.map.on('mouseenter', 'urban-risk-fill', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'urban-risk-fill', () => {
        this.map.getCanvas().style.cursor = '';
      });

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
      const res = await fetch(url);
      const data = await res.json();

      this.map.addSource(this.guciRiskSourceId, { type: 'geojson', data });

      this.map.addLayer({
        id: 'guci-risk-fill',
        type: 'fill',
        source: this.guciRiskSourceId,
        paint: {
          'fill-color': '#dc2626',
          'fill-opacity': 0.40
        }
      });

      this.map.addLayer({
        id: 'guci-risk-line',
        type: 'line',
        source: this.guciRiskSourceId,
        paint: {
          'line-color': '#991b1b',
          'line-width': 2.5,
          'line-dasharray': [2, 1]
        }
      });

      this.map.addLayer({
        id: 'guci-risk-labels',
        type: 'symbol',
        source: this.guciRiskSourceId,
        minzoom: 11,
        layout: {
          'text-field': [
            'concat',
            ['get', 'nama_desa'],
            '\nElev: ',
            ['to-string', ['get', 'elevasi_rata_m']],
            ' mdpl (Slope ',
            ['to-string', ['get', 'kemiringan_lereng_derajat']],
            '°)'
          ],
          'text-size': 11.5,
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#7f1d1d',
          'text-halo-color': '#ffffff',
          'text-halo-width': 3.0
        }
      });

      this.map.on('click', 'guci-risk-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (this.onFeatureInspectCallback) {
          this.onFeatureInspectCallback('GUCI', props);
        }
      });

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
      const res = await fetch(url);
      const data = await res.json();

      this.map.addSource(this.drainageSourceId, { type: 'geojson', data });

      // Outer glow circle
      this.map.addLayer({
        id: 'drainage-points-glow',
        type: 'circle',
        source: this.drainageSourceId,
        paint: {
          'circle-radius': 13,
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
          'circle-radius': 6.5,
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

      this.map.on('click', 'drainage-points-core', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (this.onFeatureInspectCallback) {
          this.onFeatureInspectCallback('DRAINAGE', props);
        }
      });

      this.map.on('mouseenter', 'drainage-points-core', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'drainage-points-core', () => {
        this.map.getCanvas().style.cursor = '';
      });

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
      const res = await fetch(url);
      const data = await res.json();
      this.subsidenceFeatures = data.features;

      this.map.addSource(this.subsidenceSourceId, { type: 'geojson', data });

      // Fill Layer
      this.map.addLayer({
        id: 'subsidence-fill',
        type: 'fill',
        source: this.subsidenceSourceId,
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
        paint: {
          'line-color': CAUSAL_HAZARD_CONSTANTS.LAND_SUBSIDENCE.COLOR_BORDER,
          'line-width': 2.5,
          'line-dasharray': [3, 2]
        }
      });

      // Subsidence Label
      this.map.addLayer({
        id: 'subsidence-labels',
        type: 'symbol',
        source: this.subsidenceSourceId,
        minzoom: 12,
        layout: {
          'text-field': [
            'concat',
            'Amblesan: ',
            ['get', 'nama_zona'],
            '\nLaju: ',
            ['to-string', ['get', 'laju_penurunan_cm_tahun']],
            ' cm/th'
          ],
          'text-size': 11,
          'text-anchor': 'center'
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

      this.map.on('mouseenter', 'subsidence-fill', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'subsidence-fill', () => {
        this.map.getCanvas().style.cursor = '';
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
      const res = await fetch(url);
      const data = await res.json();
      this.salineFeatures = data.features;

      this.map.addSource(this.salineSourceId, { type: 'geojson', data });

      // Translucent Amber Buffer Fill
      this.map.addLayer({
        id: 'saline-fill',
        type: 'fill',
        source: this.salineSourceId,
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
        paint: {
          'line-color': CAUSAL_HAZARD_CONSTANTS.SALINE_INTRUSION.COLOR_BORDER,
          'line-width': 2.2,
          'line-dasharray': [4, 2]
        }
      });

      // Label
      this.map.addLayer({
        id: 'saline-labels',
        type: 'symbol',
        source: this.salineSourceId,
        minzoom: 12,
        layout: {
          'text-field': [
            'concat',
            ['get', 'nama_zona'],
            '\nSalinitas: ',
            ['to-string', ['get', 'salinitas_air_tanah_ppt']],
            ' ppt'
          ],
          'text-size': 11,
          'text-anchor': 'center'
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

      this.map.on('mouseenter', 'saline-fill', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'saline-fill', () => {
        this.map.getCanvas().style.cursor = '';
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
      const res = await fetch(url);
      const data = await res.json();
      this.wasteFeatures = data.features;

      this.map.addSource(this.wasteSourceId, { type: 'geojson', data });

      // Outer glow
      this.map.addLayer({
        id: 'waste-points-glow',
        type: 'circle',
        source: this.wasteSourceId,
        paint: {
          'circle-radius': 13,
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
          'circle-radius': 6.5,
          'circle-color': '#c2410c',
          'circle-stroke-width': 2.0,
          'circle-stroke-color': '#ffffff'
        }
      });

      this.map.on('click', 'waste-points-core', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        if (this.onFeatureInspectCallback) {
          this.onFeatureInspectCallback('WASTE', props);
        }
      });

      this.map.on('mouseenter', 'waste-points-core', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'waste-points-core', () => {
        this.map.getCanvas().style.cursor = '';
      });

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
