/**
 * @file terrain.layer.js
 * @description Manages 3D terrain elevation mesh, daytime atmosphere sky, and Clean Ultra HD basemaps (Zero Commercial POIs).
 */

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CAMERA_PRESETS, BASEMAP_CONFIG, WEBGL_CONFIG } from '../config/map.constants.js';

if (typeof window !== 'undefined') {
  window.maplibregl = maplibregl;
}

export class TerrainManager {
  /**
   * Initializes MapLibre GL map instance with 3D terrain and Clean HD satellite basemap (no POI pins)
   * @param {string} containerId
   * @returns {maplibregl.Map}
   */
  static createMap(containerId) {
    const initial = CAMERA_PRESETS.KOTA_TEGAL;
    const defaultBasemap = BASEMAP_CONFIG.GOOGLE_SATELLITE; // Pure satellite without commercial POI pins

    const map = new maplibregl.Map({
      container: containerId,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          'basemap-tiles': {
            type: 'raster',
            tiles: [defaultBasemap.url],
            tileSize: 256,
            attribution: defaultBasemap.attribution,
            maxzoom: defaultBasemap.maxzoom
          },
          'terrain-source': {
            type: 'raster-dem',
            tiles: [
              'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
            ],
            encoding: 'terrarium',
            tileSize: 256,
            maxzoom: 15
          }
        },
        layers: [
          {
            id: 'basemap-layer',
            type: 'raster',
            source: 'basemap-tiles',
            minzoom: 0,
            maxzoom: 22,
            paint: {
              'raster-resampling': 'linear',
              'raster-fade-duration': 100
            }
          }
        ]
      },
      center: initial.center,
      zoom: initial.zoom,
      pitch: initial.pitch,
      bearing: initial.bearing,
      maxPitch: 80,
      maxZoom: 21
    });

    // Navigation control
    map.addControl(new maplibregl.NavigationControl({
      visualizePitch: true,
      showCompass: true
    }), 'top-right');

    // Filter benign tile aborts during fast camera flights
    map.on('error', (e) => {
      if (e?.error?.name === 'AbortError' || e?.error?.message?.includes('abort')) {
        return;
      }
      console.warn('[MapLibre Notice]', e?.error?.message || e);
    });

    map.on('load', () => {
      // Deterministically calibrate WebGL viewport framebuffer size
      map.resize();
      requestAnimationFrame(() => map.resize());
      setTimeout(() => map.resize(), 200);

      try {
        map.setTerrain({
          source: 'terrain-source',
          exaggeration: WEBGL_CONFIG.TERRAIN_EXAGGERATION
        });
        console.log('[TerrainManager] 3D Terrain mesh activated with clean HD Satellite (no POIs).');
      } catch (err) {
        console.warn('[TerrainManager] Terrain notice:', err.message);
      }
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => map.resize());
    }

    return map;
  }

  /**
   * Switches the active raster basemap dynamically
   * @param {maplibregl.Map} map
   * @param {'GOOGLE_SATELLITE'|'ESRI_SATELLITE'|'STREET'|'DARK'} basemapType
   */
  static switchBasemap(map, basemapType) {
    const config = BASEMAP_CONFIG[basemapType];
    if (!config || !map) return;

    try {
      if (map.getLayer('basemap-layer')) {
        map.removeLayer('basemap-layer');
      }
      if (map.getSource('basemap-tiles')) {
        map.removeSource('basemap-tiles');
      }

      map.addSource('basemap-tiles', {
        type: 'raster',
        tiles: [config.url],
        tileSize: 256,
        attribution: config.attribution,
        maxzoom: config.maxzoom
      });

      const firstLayerId = map.getStyle().layers?.[0]?.id;
      map.addLayer(
        {
          id: 'basemap-layer',
          type: 'raster',
          source: 'basemap-tiles',
          minzoom: 0,
          maxzoom: 22,
          paint: {
            'raster-resampling': 'linear',
            'raster-fade-duration': 100
          }
        },
        firstLayerId
      );

      console.log(`[TerrainManager] Basemap switched to: ${config.name}`);
    } catch (err) {
      console.error('[TerrainManager] Error switching basemap:', err);
    }
  }
}
