/**
 * @file tutorial.component.js
 * @description Native Game-Style Interactive Walkthrough Controller for SI-BAHARI 3D.
 * Computes SVG spotlight cutouts, dynamically anchors popover cards, orchestrates 3D camera sweeps,
 * and provides idempotent event binding with navigation locks and interactive progress dots.
 */

import { TUTORIAL_STEPS } from './tutorial.steps.js';
import { renderTutorialContainer } from './tutorial.template.js';

// Named Constants for Production Predictability & Rule Compliance
const NAV_LOCK_DURATION_MS = 280;
const DRAWER_SETTLE_DELAY_MS = 320;
const PRELIMINARY_ALIGN_DELAY_MS = 50;
const SPOTLIGHT_PADDING_PX = 6;
const POPOVER_GAP_PX = 14;
const VIEWPORT_MARGIN_PX = 16;
const ARROW_HALF_SIZE_PX = 7;
const ARROW_CLAMP_MIN_PX = 24;
const ARROW_CLAMP_OFFSET_PX = 36;
const DEFAULT_CARD_WIDTH_PX = 380;
const DEFAULT_CARD_HEIGHT_PX = 260;

export class TutorialComponent {
  /**
   * @param {Object} options
   * @param {import('../../controllers/camera.controller.js').CameraController} options.cameraController
   * @param {Function} [options.onComplete] Callback when tutorial finishes
   */
  constructor({ cameraController, onComplete } = {}) {
    this.cameraController = cameraController;
    this.onComplete = onComplete || (() => {});

    this.currentStepIndex = 0;
    this.isActive = false;
    this.isMounted = false;
    this.isBound = false;
    this.isNavigating = false;

    // DOM References
    this.rootElement = null;
    this.cutoutRect = null;
    this.highlightRing = null;
    this.popoverCard = null;

    this.cardCategory = null;
    this.cardStepBadge = null;
    this.cardTitle = null;
    this.cardDescription = null;
    this.cardHintText = null;
    this.btnPrev = null;
    this.btnNext = null;
    this.btnNextLabel = null;
    this.progressDotsContainer = null;

    // Stable Handlers for Guaranteed Idempotent Event Binding
    this._onNextClick = () => this.next();
    this._onPrevClick = () => this.prev();
    this._onSkipClick = () => this.stop();
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleResize = this._handleResize.bind(this);
  }

  /**
   * Mounts the tutorial DOM overlay into document.body
   */
  mount() {
    if (this.isMounted || document.getElementById('tutorial-root')) {
      this.rootElement = document.getElementById('tutorial-root');
      this._bindDomReferences();
      this.isMounted = true;
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = renderTutorialContainer();
    const container = tempDiv.firstElementChild;
    document.body.appendChild(container);

    this.rootElement = container;
    this._bindDomReferences();
    this.isMounted = true;
  }

  /**
   * Binds DOM references and event listeners strictly once (idempotent)
   * @private
   */
  _bindDomReferences() {
    if (this.isBound) return;

    this.cutoutRect = document.getElementById('tutorial-cutout-rect');
    this.highlightRing = document.getElementById('tutorial-highlight-ring');
    this.popoverCard = document.getElementById('tutorial-popover-card');

    this.cardCategory = document.getElementById('tutorial-card-category');
    this.cardStepBadge = document.getElementById('tutorial-card-step-badge');
    this.cardTitle = document.getElementById('tutorial-card-title');
    this.cardDescription = document.getElementById('tutorial-card-description');
    this.cardHintText = document.getElementById('tutorial-card-hint-text');
    this.btnPrev = document.getElementById('btn-tutorial-prev');
    this.btnNext = document.getElementById('btn-tutorial-next');
    this.btnNextLabel = document.getElementById('tutorial-btn-next-label');
    this.progressDotsContainer = document.getElementById('tutorial-progress-dots');

    const btnSkip = document.getElementById('btn-tutorial-skip');
    if (btnSkip) {
      btnSkip.addEventListener('click', this._onSkipClick);
    }

    if (this.btnPrev) {
      this.btnPrev.addEventListener('click', this._onPrevClick);
    }

    if (this.btnNext) {
      this.btnNext.addEventListener('click', this._onNextClick);
    }

    this.isBound = true;
  }

  /**
   * Starts the interactive tutorial strictly from step 0 with duplicate event safeguards
   */
  start() {
    this.mount();
    this.isActive = true;
    this.isNavigating = false;
    this.currentStepIndex = 0;

    if (this.rootElement) {
      this.rootElement.classList.remove('tutorial-hidden');
    }

    // Safely reset window listeners to prevent stacked triggers
    window.removeEventListener('keydown', this._handleKeyDown);
    window.removeEventListener('resize', this._handleResize);

    window.addEventListener('keydown', this._handleKeyDown);
    window.addEventListener('resize', this._handleResize);

    // Initial render
    this.renderCurrentStep();
  }

  /**
   * Stops the tutorial, cleans up listeners, and restores standard UI state
   */
  stop() {
    if (!this.isActive) return;

    this.isActive = false;
    this.isNavigating = false;

    if (this.rootElement) {
      this.rootElement.classList.add('tutorial-hidden');
    }

    // Ensure main drawer is open for full access to data layers and analytics
    const drawer = document.getElementById('app-drawer');
    if (drawer && drawer.classList.contains('-translate-x-full')) {
      drawer.classList.remove('-translate-x-full');
    }

    window.removeEventListener('keydown', this._handleKeyDown);
    window.removeEventListener('resize', this._handleResize);

    this.onComplete();
  }

  /**
   * Jumps directly to a specific step index with navigation lock protection
   * @param {number} targetIndex 0-based index
   */
  goToStep(targetIndex) {
    if (this.isNavigating) return;
    if (targetIndex < 0 || targetIndex >= TUTORIAL_STEPS.length) return;
    if (targetIndex === this.currentStepIndex) return;

    this.isNavigating = true;
    setTimeout(() => {
      this.isNavigating = false;
    }, NAV_LOCK_DURATION_MS);

    this.currentStepIndex = targetIndex;
    this.renderCurrentStep();
  }

  /**
   * Advances strictly one step forward with transition lock protection
   */
  next() {
    if (this.isNavigating) return;

    if (this.currentStepIndex < TUTORIAL_STEPS.length - 1) {
      this.isNavigating = true;
      setTimeout(() => {
        this.isNavigating = false;
      }, NAV_LOCK_DURATION_MS);

      this.currentStepIndex++;
      this.renderCurrentStep();
    } else {
      this.stop();
    }
  }

  /**
   * Goes back strictly one step with transition lock protection
   */
  prev() {
    if (this.isNavigating) return;

    if (this.currentStepIndex > 0) {
      this.isNavigating = true;
      setTimeout(() => {
        this.isNavigating = false;
      }, NAV_LOCK_DURATION_MS);

      this.currentStepIndex--;
      this.renderCurrentStep();
    }
  }

  /**
   * Renders the active tutorial step with spotlight, dynamic arrow, and interactive dots
   */
  renderCurrentStep() {
    const step = TUTORIAL_STEPS[this.currentStepIndex];
    if (!step) return;

    // 1. Manage Drawer collapse / expand based on step requirement
    const drawer = document.getElementById('app-drawer');
    if (step.drawerTab) {
      if (drawer && drawer.classList.contains('-translate-x-full')) {
        drawer.classList.remove('-translate-x-full');
      }
      const tabBtn = document.querySelector(`.tab-btn[data-tab="${step.drawerTab}"]`);
      if (tabBtn) tabBtn.click();
    } else {
      // If step targets external controls (e.g. top header or bottom water slider), collapse drawer
      if (drawer && !drawer.classList.contains('-translate-x-full')) {
        drawer.classList.add('-translate-x-full');
      }
    }

    // 2. Camera sweeps to relevant spot
    if (this.cameraController) {
      if (step.cameraPreset) {
        this.cameraController.flyToZone(step.cameraPreset);
      } else if (step.cameraCoordinates) {
        this.cameraController.flyToSpot(step.cameraCoordinates, step.cameraZoom, step.cameraPitch);
      }
    }

    // 3. Update text content
    if (this.cardCategory) this.cardCategory.textContent = step.category;
    if (this.cardStepBadge) this.cardStepBadge.textContent = `Langkah ${step.stepIndex} dari ${TUTORIAL_STEPS.length}`;
    if (this.cardTitle) this.cardTitle.textContent = step.title;
    if (this.cardDescription) this.cardDescription.textContent = step.description;
    if (this.cardHintText) this.cardHintText.textContent = step.actionHint;

    // Update buttons
    if (this.btnPrev) {
      this.btnPrev.disabled = this.currentStepIndex === 0;
    }
    if (this.btnNextLabel) {
      this.btnNextLabel.textContent = this.currentStepIndex === TUTORIAL_STEPS.length - 1 ? 'Selesai & Jelajahi' : 'Selanjutnya ►';
    }

    // 4. Update progress dots as interactive buttons
    if (this.progressDotsContainer) {
      this.progressDotsContainer.innerHTML = TUTORIAL_STEPS.map((_, i) => `
        <button type="button" class="tutorial-dot-btn h-2 rounded-full transition-all cursor-pointer focus:outline-none ${i === this.currentStepIndex ? 'w-6 bg-sky-600' : 'w-2 bg-slate-300 hover:bg-slate-400'}" data-step-index="${i}" title="Beralih langsung ke Langkah ${i + 1}">
          <span class="sr-only">Langkah ${i + 1}</span>
        </button>
      `).join('');

      const dotButtons = this.progressDotsContainer.querySelectorAll('.tutorial-dot-btn');
      dotButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetIndex = parseInt(btn.getAttribute('data-step-index'), 10);
          if (!Number.isNaN(targetIndex)) {
            this.goToStep(targetIndex);
          }
        });
      });
    }

    // 5. Compute Spotlight Cutout & Popover Alignment
    // Dual positioning: fast preliminary position + accurate lock-in after 300ms CSS drawer transition
    setTimeout(() => {
      this._positionSpotlightAndCard(step);
    }, PRELIMINARY_ALIGN_DELAY_MS);

    setTimeout(() => {
      this._positionSpotlightAndCard(step);
    }, DRAWER_SETTLE_DELAY_MS);
  }

  /**
   * Positions spotlight mask and highlight ring around target DOM element
   * @param {Object} step
   * @private
   */
  _positionSpotlightAndCard(step) {
    const targetEl = document.querySelector(step.targetSelector);

    let targetRect = {
      x: window.innerWidth / 2 - 100,
      y: window.innerHeight / 2 - 50,
      width: 200,
      height: 100
    };

    if (targetEl) {
      const r = targetEl.getBoundingClientRect();
      targetRect = {
        x: Math.max(0, r.left - SPOTLIGHT_PADDING_PX),
        y: Math.max(0, r.top - SPOTLIGHT_PADDING_PX),
        width: r.width + SPOTLIGHT_PADDING_PX * 2,
        height: r.height + SPOTLIGHT_PADDING_PX * 2
      };
    }

    // Update SVG Spotlight Cutout Rect
    if (this.cutoutRect) {
      this.cutoutRect.setAttribute('x', targetRect.x);
      this.cutoutRect.setAttribute('y', targetRect.y);
      this.cutoutRect.setAttribute('width', targetRect.width);
      this.cutoutRect.setAttribute('height', targetRect.height);
    }

    // Update Pulsing Highlight Ring
    if (this.highlightRing) {
      this.highlightRing.style.left = `${targetRect.x}px`;
      this.highlightRing.style.top = `${targetRect.y}px`;
      this.highlightRing.style.width = `${targetRect.width}px`;
      this.highlightRing.style.height = `${targetRect.height}px`;
    }

    // Position Popover Card intelligently relative to targetRect
    this._positionPopoverCard(targetRect, step.preferredPosition);
  }

  /**
   * Calculates popover card coordinates relative to target bounding box
   * @param {Object} targetRect
   * @param {'top'|'bottom'|'left'|'right'} preferredPosition
   * @private
   */
  _positionPopoverCard(targetRect, preferredPosition) {
    if (!this.popoverCard) return;

    const cardRect = this.popoverCard.getBoundingClientRect();
    const cardWidth = cardRect.width || DEFAULT_CARD_WIDTH_PX;
    const cardHeight = cardRect.height || DEFAULT_CARD_HEIGHT_PX;

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let position = preferredPosition;

    // Responsive fallback for narrow screens
    if (position === 'right' && (targetRect.x + targetRect.width + POPOVER_GAP_PX + cardWidth > viewportW - VIEWPORT_MARGIN_PX)) {
      if (targetRect.y + targetRect.height + POPOVER_GAP_PX + cardHeight <= viewportH - VIEWPORT_MARGIN_PX) {
        position = 'bottom';
      } else if (targetRect.y - cardHeight - POPOVER_GAP_PX >= VIEWPORT_MARGIN_PX) {
        position = 'top';
      }
    }

    let left = 0;
    let top = 0;

    if (position === 'bottom') {
      top = targetRect.y + targetRect.height + POPOVER_GAP_PX;
      left = targetRect.x + targetRect.width / 2 - cardWidth / 2;
    } else if (position === 'top') {
      top = targetRect.y - cardHeight - POPOVER_GAP_PX;
      left = targetRect.x + targetRect.width / 2 - cardWidth / 2;
    } else if (position === 'right') {
      left = targetRect.x + targetRect.width + POPOVER_GAP_PX;
      top = targetRect.y + targetRect.height / 2 - cardHeight / 2;
    } else {
      left = targetRect.x - cardWidth - POPOVER_GAP_PX;
      top = targetRect.y + targetRect.height / 2 - cardHeight / 2;
    }

    // Clamp coordinates so card never overflows the screen edges
    if (left + cardWidth > viewportW - VIEWPORT_MARGIN_PX) {
      left = viewportW - cardWidth - VIEWPORT_MARGIN_PX;
    }
    if (left < VIEWPORT_MARGIN_PX) {
      left = VIEWPORT_MARGIN_PX;
    }
    if (top + cardHeight > viewportH - VIEWPORT_MARGIN_PX) {
      top = viewportH - cardHeight - VIEWPORT_MARGIN_PX;
    }
    if (top < VIEWPORT_MARGIN_PX) {
      top = VIEWPORT_MARGIN_PX;
    }

    this.popoverCard.style.left = `${Math.round(left)}px`;
    this.popoverCard.style.top = `${Math.round(top)}px`;

    // Dynamically position caret arrow pointing towards target
    this._updateArrow(position, targetRect, left, top, cardWidth, cardHeight);
  }

  /**
   * Positions geometric caret arrow indicator towards target element center
   * @private
   */
  _updateArrow(position, targetRect, cardLeft, cardTop, cardWidth, cardHeight) {
    const arrow = document.getElementById('tutorial-card-arrow');
    if (!arrow) return;

    arrow.className = '';
    arrow.style.left = '';
    arrow.style.right = '';
    arrow.style.top = '';
    arrow.style.bottom = '';

    if (position === 'bottom') {
      arrow.className = 'arrow-top';
      arrow.style.top = '-7px';
      const targetCenterX = targetRect.x + targetRect.width / 2;
      const offset = Math.min(Math.max(targetCenterX - cardLeft - ARROW_HALF_SIZE_PX, ARROW_CLAMP_MIN_PX), cardWidth - ARROW_CLAMP_OFFSET_PX);
      arrow.style.left = `${Math.round(offset)}px`;
    } else if (position === 'top') {
      arrow.className = 'arrow-bottom';
      arrow.style.bottom = '-7px';
      const targetCenterX = targetRect.x + targetRect.width / 2;
      const offset = Math.min(Math.max(targetCenterX - cardLeft - ARROW_HALF_SIZE_PX, ARROW_CLAMP_MIN_PX), cardWidth - ARROW_CLAMP_OFFSET_PX);
      arrow.style.left = `${Math.round(offset)}px`;
    } else if (position === 'right') {
      arrow.className = 'arrow-left';
      arrow.style.left = '-7px';
      const targetCenterY = targetRect.y + targetRect.height / 2;
      const offset = Math.min(Math.max(targetCenterY - cardTop - ARROW_HALF_SIZE_PX, ARROW_CLAMP_MIN_PX), cardHeight - ARROW_CLAMP_OFFSET_PX);
      arrow.style.top = `${Math.round(offset)}px`;
    } else {
      arrow.className = 'arrow-right';
      arrow.style.right = '-7px';
      const targetCenterY = targetRect.y + targetRect.height / 2;
      const offset = Math.min(Math.max(targetCenterY - cardTop - ARROW_HALF_SIZE_PX, ARROW_CLAMP_MIN_PX), cardHeight - ARROW_CLAMP_OFFSET_PX);
      arrow.style.top = `${Math.round(offset)}px`;
    }
  }

  /**
   * Handles keyboard navigation with collision avoidance
   * @param {KeyboardEvent} e
   * @private
   */
  _handleKeyDown(e) {
    if (!this.isActive) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.stop();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    } else if (e.key === 'Enter') {
      // If a button is focused, native button click already handles it; avoid duplicate step advance
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
        return;
      }
      e.preventDefault();
      this.next();
    }
  }

  /**
   * Repositions elements on viewport resize
   * @private
   */
  _handleResize() {
    if (!this.isActive) return;
    const step = TUTORIAL_STEPS[this.currentStepIndex];
    if (step) {
      this._positionSpotlightAndCard(step);
    }
  }
}
