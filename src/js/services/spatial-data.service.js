/**
 * @file spatial-data.service.js
 * @description Centralized Spatial Data Repository for SI-BAHARI 3D.
 * Implements Repository Pattern with in-memory caching and fail-safe path resolution.
 */

export class SpatialDataService {
  static _cache = new Map();

  /**
   * Resolves base path dynamically for local dev, GitHub Pages, or Cloudflare Pages
   * @returns {string}
   */
  static getBasePath() {
    return window.location.pathname.includes('/src/') ? '../data/processed' : './data/processed';
  }

  /**
   * Retrieves data URLs dictionary for all production GeoJSON layers
   * @returns {Object<string, string>}
   */
  static getDataUrls() {
    const base = this.getBasePath();
    return Object.freeze({
      buildings: `${base}/buildings_footprints_tegal.geojson`,
      urbanRisk: `${base}/tegal_hybrid_risk.geojson`,
      guciRisk: `${base}/guci_landslide_risk.geojson`,
      drainage: `${base}/drainage_critical_points.geojson`,
      subsidence: `${base}/tegal_land_subsidence.geojson`,
      saline: `${base}/tegal_saline_intrusion.geojson`,
      waste: `${base}/drainage_waste_chokes.geojson`
    });
  }

  /**
   * Fetches GeoJSON with in-memory caching
   * @param {string} url
   * @returns {Promise<Object>}
   */
  static async fetchGeoJson(url) {
    if (this._cache.has(url)) {
      return this._cache.get(url);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: Failed to fetch ${url}`);
      }
      const data = await response.json();
      this._cache.set(url, data);
      return data;
    } catch (err) {
      console.error(`[SpatialDataService] Error loading spatial dataset from ${url}:`, err);
      throw err;
    }
  }

  /**
   * Clears the in-memory cache
   */
  static clearCache() {
    this._cache.clear();
  }
}
