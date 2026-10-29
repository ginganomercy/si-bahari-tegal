/**
 * @file storage.service.js
 * @description Safe LocalStorage service for user preferences in SI-BAHARI 3D.
 * Handles edge cases like incognito mode, blocked storage, and quota exceptions.
 */

const STORAGE_KEYS = Object.freeze({
  HIDE_LANDING: 'sibahari_hide_landing_v1',
  ACTIVE_PRESET: 'sibahari_active_preset_v1'
});

export class StorageService {
  /**
   * Checks if user has chosen to bypass the landing page on startup
   * @returns {boolean}
   */
  static shouldShowLanding() {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.HIDE_LANDING);
      return val !== 'true';
    } catch (e) {
      console.warn('[StorageService] LocalStorage read unavailable:', e);
      return true; // Safe fallback: show landing page
    }
  }

  /**
   * Persists user choice regarding landing page automatic visibility
   * @param {boolean} shouldHide
   */
  static setHideLanding(shouldHide) {
    try {
      if (shouldHide) {
        localStorage.setItem(STORAGE_KEYS.HIDE_LANDING, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.HIDE_LANDING);
      }
    } catch (e) {
      console.warn('[StorageService] LocalStorage write unavailable:', e);
    }
  }

  /**
   * Clears all SI-BAHARI 3D preferences
   */
  static clearPreferences() {
    try {
      localStorage.removeItem(STORAGE_KEYS.HIDE_LANDING);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PRESET);
    } catch (e) {
      console.warn('[StorageService] LocalStorage clear error:', e);
    }
  }
}

