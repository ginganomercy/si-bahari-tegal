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
   * Flies camera to designated major zone with cinematic transition
   * @param {'KOTA_TEGAL'|'GUCI_BUMIJAWA'} zoneKey
   */
  flyToZone(zoneKey) {
    const preset = CAMERA_PRESETS[zoneKey];
    if (!preset) return;

    this.activeZone = zoneKey;
    this.map.flyTo({
      center: preset.center,
      zoom: preset.zoom,
      pitch: preset.pitch,
      bearing: preset.bearing,
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
