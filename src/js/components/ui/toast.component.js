/**
 * @file toast.component.js
 * @description Non-blocking enterprise toast notification system for SI-BAHARI 3D.
 * Displays network alerts, data status, and system feedback with smooth CSS animations.
 */

export class ToastComponent {
  static container = null;

  /**
   * Ensures the floating toast container is mounted in document.body
   * @private
   */
  static _ensureContainer() {
    if (this.container && document.body.contains(this.container)) return;

    let container = document.getElementById('toast-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-root';
      container.className = 'fixed bottom-5 right-5 z-[90] flex flex-col gap-2 pointer-events-none max-w-sm w-full';
      document.body.appendChild(container);
    }
    this.container = container;
  }

  /**
   * Displays a toast notification
   * @param {string} message Text message to display
   * @param {'info'|'success'|'warning'|'error'} [type='info'] Notification variant
   * @param {number} [durationMs=4000] Time before toast dismisses
   */
  static show(message, type = 'info', durationMs = 4000) {
    this._ensureContainer();

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold';

    let iconSvg = '';
    let colorClasses = '';

    switch (type) {
      case 'success':
        colorClasses = 'bg-emerald-50 border-emerald-200 text-emerald-900';
        iconSvg = '<svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
        break;
      case 'warning':
        colorClasses = 'bg-amber-50 border-amber-200 text-amber-900';
        iconSvg = '<svg class="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
        break;
      case 'error':
        colorClasses = 'bg-rose-50 border-rose-200 text-rose-900';
        iconSvg = '<svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
        break;
      default:
        colorClasses = 'bg-white border-slate-200 text-slate-800';
        iconSvg = '<svg class="w-4 h-4 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
        break;
    }

    toast.className += ` ${colorClasses}`;
    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    this.container.appendChild(toast);

    // Trigger GPU entrance transition
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Auto dismiss
    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, durationMs);
  }
}

