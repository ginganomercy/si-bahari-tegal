/**
 * @file camera.controller.js
 * @description Controls cinematic camera transitions and spot inspection fly-to.
 */

import { CAMERA_PRESETS } from '../config/map.constants.js';

export class CameraController {
  /**
   * @param {maplibregl.Map} map
   */
  constructor(map) {
    if (!map) {
      throw new Error('CameraController requires a valid MapLibre GL map instance.');
    }
    this.map = map;
    this.activeZone = 'KOTA_TEGAL';
  }

  /**
   * Helper to compute safe viewport padding for camera transitions
   * Offsets the projection on mobile so targets are centered above bottom floating UI
   * @private
   * @returns {maplibregl.PaddingOptions}
   */
  _getViewportPadding() {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return { top: 68, bottom: 120, left: 0, right: 0 };
    }
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  /**
   * Flies camera to designated major zone with cinematic transition
   * @param {'KOTA_TEGAL'|'GUCI_BUMIJAWA'} zoneKey
   */
  flyToZone(zoneKey) {
    const preset = CAMERA_PRESETS[zoneKey];
    if (!preset) return;

    this.activeZone = zoneKey;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    this.map.flyTo({
      center: preset.center,
      zoom: isMobile ? preset.zoom - 0.25 : preset.zoom,
      pitch: preset.pitch,
      bearing: preset.bearing,
      padding: this._getViewportPadding(),
      essential: true,
      duration: 2200,
      curve: 1.35
    });
  }

  /**
   * Flies camera directly to a target coordinate (e.g. for inspecting a drainage bottleneck)
   * @param {[number, number]} coordinates - [longitude, latitude]
   * @param {number} [zoom=16.0]
   * @param {number} [pitch=55.0]
   */
  flyToSpot(coordinates, zoom = 16.0, pitch = 55.0) {
    this.map.flyTo({
      center: coordinates,
      zoom: zoom,
      pitch: pitch,
      bearing: (Math.random() - 0.5) * 40,
      padding: this._getViewportPadding(),
      essential: true,
      duration: 1800
    });
  }

  /**
   * Resets camera rotation to North
   */
  resetNorth() {
    this.map.resetNorthPitch({ duration: 1000 });
  }

  /**
   * @returns {'KOTA_TEGAL'|'GUCI_BUMIJAWA'}
   */
  getActiveZone() {
    return this.activeZone;
  }
}
