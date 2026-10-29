/**
 * @file landing.component.js
 * @description Controller for the SI-BAHARI 3D Onboarding & Executive Briefing Portal.
 * Manages DOM mounting, event handling, GPU transitions, and preference persistence.
 */

import { renderLandingTemplate } from './landing.template.js';
import { StorageService } from '../../services/storage.service.js';

export class LandingComponent {
  /**
   * @param {Object} options
   * @param {Function} [options.onExplore] Callback when user enters the 3D map
   * @param {Function} [options.onQuickScenario] Callback when user picks quick scenario
   * @param {Function} [options.onStartTutorial] Callback when user launches step-by-step tutorial
   */
  constructor({ onExplore, onQuickScenario, onStartTutorial } = {}) {
    this.onExplore = onExplore || (() => {});
    this.onQuickScenario = onQuickScenario || (() => {});
    this.onStartTutorial = onStartTutorial || (() => {});
    this.overlayElement = null;
    this.checkboxDontShow = null;
    this.isMounted = false;
  }

  /**
   * Injects the template into DOM if not already present
   */
  mount() {
    if (this.isMounted || document.getElementById('landing-overlay')) {
      this.overlayElement = document.getElementById('landing-overlay');
      this.isMounted = true;
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = renderLandingTemplate();
    const overlay = tempDiv.firstElementChild;
    document.body.appendChild(overlay);

    this.overlayElement = overlay;
    this.isMounted = true;
  }

  /**
   * Initializes listeners and checks display preference
   */
  init() {
    this.mount();

    if (!this.overlayElement) return;

    this.checkboxDontShow = document.getElementById('check-dont-show-landing');
    const btnExplore = document.getElementById('btn-landing-explore');
    const btnQuickScenario = document.getElementById('btn-landing-quick-scenario');
    const btnTutorial = document.getElementById('btn-landing-tutorial');
    const btnClose = document.getElementById('btn-close-landing');

    // Sync initial checkbox state
    if (this.checkboxDontShow) {
      this.checkboxDontShow.checked = !StorageService.shouldShowLanding();
    }

    // Check if should be initially visible
    const shouldShow = StorageService.shouldShowLanding();
    if (!shouldShow) {
      this.overlayElement.classList.add('landing-hidden');
    }

    // Bind Tutorial button
    if (btnTutorial) {
      btnTutorial.addEventListener('click', () => {
        this._savePreference();
        this.hide();
        this.onStartTutorial();
      });
    }

    // Bind Explore button
    if (btnExplore) {
      btnExplore.addEventListener('click', () => {
        this._savePreference();
        this.hide();
        this.onExplore();
      });
    }

    // Bind Quick Scenario button
    if (btnQuickScenario) {
      btnQuickScenario.addEventListener('click', () => {
        this._savePreference();
        this.hide();
        this.onQuickScenario('SPRING_TIDE');
      });
    }

    // Bind Close (X) button
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        this._savePreference();
        this.hide();
      });
    }

    // ESC key listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this._savePreference();
        this.hide();
      }
    });
  }

  _savePreference() {
    if (this.checkboxDontShow) {
      StorageService.setHideLanding(this.checkboxDontShow.checked);
    }
  }

  /**
   * Displays the landing overlay with smooth GPU transition
   */
  show() {
    if (!this.overlayElement) this.mount();
    if (this.checkboxDontShow) {
      this.checkboxDontShow.checked = !StorageService.shouldShowLanding();
    }
    this.overlayElement.classList.remove('landing-hidden');
  }

  /**
   * Hides the landing overlay with smooth GPU fade-out
   */
  hide() {
    if (this.overlayElement) {
      this.overlayElement.classList.add('landing-hidden');
    }
  }

  /**
   * Checks if landing page is currently displayed
   * @returns {boolean}
   */
  isVisible() {
    return this.overlayElement && !this.overlayElement.classList.contains('landing-hidden');
  }
}

