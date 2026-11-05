/**
 * @file inspector.component.js
 * @description Controller for the Technical Inspector Slide-Over Drawer in SI-BAHARI 3D.
 * Manages view switching, markup rendering, animations, and camera synchronization.
 */

import {
  renderDrainageInspection,
  renderWasteInspection,
  renderSubsidenceInspection,
  renderSalineInspection,
  renderKelurahanInspection,
  renderGuciInspection,
  renderPolderInspection
} from './inspector.template.js';

export class InspectorComponent {
  constructor() {
    this.drawer = null;
    this.title = null;
    this.body = null;
    this.btnClose = null;
    this.isMounted = false;
  }

  /**
   * Initializes DOM references and binds close button event listener
   */
  init() {
    if (this.isMounted) return;

    this.drawer = document.getElementById('inspector-drawer');
    this.title = document.getElementById('inspector-title');
    this.body = document.getElementById('inspector-body');
    this.btnClose = document.getElementById('btn-close-inspector');

    if (this.btnClose && this.drawer) {
      this.btnClose.addEventListener('click', () => {
        this.close();
      });
    }

    this.isMounted = true;
  }

  /**
   * Opens the slide-over drawer and renders the corresponding inspection template
   * @param {'DRAINAGE'|'WASTE'|'SUBSIDENCE'|'SALINE'|'KELURAHAN'|'GUCI'|'POLDER'} type
   * @param {Object} props Feature properties
   */
  open(type, props) {
    if (!this.isMounted) this.init();
    if (!this.drawer || !this.title || !this.body) return;

    switch (type) {
      case 'DRAINAGE':
        this.title.textContent = props.lokasi || 'Titik Kritis Drainase';
        this.body.innerHTML = renderDrainageInspection(props);
        break;

      case 'WASTE':
        this.title.textContent = props.lokasi || 'Titik Sumbatan Sampah';
        this.body.innerHTML = renderWasteInspection(props);
        break;

      case 'SUBSIDENCE':
        this.title.textContent = props.nama_zona || 'Zona Penurunan Tanah';
        this.body.innerHTML = renderSubsidenceInspection(props);
        break;

      case 'SALINE':
        this.title.textContent = props.nama_zona || 'Intrusi Air Asin';
        this.body.innerHTML = renderSalineInspection(props);
        break;

      case 'KELURAHAN':
        this.title.textContent = `Kelurahan ${props.nama_kelurahan || ''}`;
        this.body.innerHTML = renderKelurahanInspection(props);
        break;

      case 'GUCI':
        this.title.textContent = props.nama_desa || 'Kawasan Hulu Guci';
        this.body.innerHTML = renderGuciInspection(props);
        break;

      case 'POLDER':
        this.title.textContent = props.name || 'Stasiun Pompa Polder';
        this.body.innerHTML = renderPolderInspection(props);
        break;

      default:
        console.warn(`[InspectorComponent] Unknown inspection type: ${type}`);
        return;
    }

    this.drawer.classList.add('translate-x-0');
  }

  /**
   * Closes the slide-over drawer
   */
  close() {
    if (this.drawer) {
      this.drawer.classList.remove('translate-x-0');
    }
  }

  /**
   * Checks whether the drawer is currently open
   * @returns {boolean}
   */
  isOpen() {
    return Boolean(this.drawer && this.drawer.classList.contains('translate-x-0'));
  }
}
