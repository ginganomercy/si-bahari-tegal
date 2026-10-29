/**
 * @file tutorial.template.js
 * @description Markup generator for the SI-BAHARI 3D Interactive Video Game Tutorial.
 * Provides SVG spotlight cutout mask, pulsing highlight ring, and floating enterprise dialog card.
 */

export function renderTutorialContainer() {
  return `
    <div id="tutorial-root" class="fixed inset-0 z-[60] pointer-events-auto transition-opacity duration-300 tutorial-hidden">
      <!-- Fullscreen SVG Spotlight Mask -->
      <svg id="tutorial-mask-svg" class="fixed inset-0 w-full h-full pointer-events-none z-[60]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="tutorial-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect id="tutorial-cutout-rect" x="0" y="0" width="0" height="0" rx="12" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.72)" mask="url(#tutorial-spotlight-mask)" />
      </svg>

      <!-- Pulsing Highlight Ring around Spotlighted Target -->
      <div id="tutorial-highlight-ring" class="fixed pointer-events-none z-[65] border-2 border-sky-400 rounded-xl shadow-[0_0_24px_rgba(56,189,248,0.55)] transition-all duration-300">
        <div class="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-sky-400 animate-ping"></div>
      </div>

      <!-- Floating Tooltip Dialog Card (Enterprise Light Theme - Pure Solid White) -->
      <div id="tutorial-popover-card" class="fixed z-[70] w-[380px] max-w-[calc(100vw-32px)] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 sm:p-5 text-slate-800 transition-all duration-300">
        <!-- Caret Arrow Pointer pointing to Target Element -->
        <div id="tutorial-card-arrow" class="arrow-top"></div>

        <!-- Top Step Header -->
        <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
            <span id="tutorial-card-category" class="text-[10px] font-black uppercase tracking-wider text-sky-700">Panduan Fitur</span>
          </div>
          <div class="flex items-center gap-2">
            <span id="tutorial-card-step-badge" class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Langkah 1 dari 5
            </span>
            <button type="button" id="btn-tutorial-skip" class="text-[10px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors" title="Lewati Tutorial (Esc)">
              Lewati (Esc)
            </button>
          </div>
        </div>

        <!-- Body Content -->
        <div class="pt-3 space-y-2">
          <h3 id="tutorial-card-title" class="text-sm sm:text-base font-black text-slate-900 leading-snug tracking-tight">
            Judul Langkah Tutorial
          </h3>
          <p id="tutorial-card-description" class="text-xs text-slate-700 leading-relaxed font-normal">
            Deskripsi rinci mengenai fungsi tombol atau panel yang sedang disorot.
          </p>

          <div id="tutorial-card-hint-box" class="bg-sky-50 border border-sky-200/90 rounded-xl px-3 py-2 flex items-center gap-2 text-[11px] text-sky-950 font-medium shadow-sm">
            <svg class="w-4 h-4 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span id="tutorial-card-hint-text" class="text-sky-900 font-semibold">Aksi yang disarankan</span>
          </div>
        </div>

        <!-- Footer Navigation Controls -->
        <div class="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <!-- Step Progress Dots -->
          <div id="tutorial-progress-dots" class="flex items-center gap-1.5">
            <!-- Populated dynamically via component -->
          </div>

          <div class="flex items-center gap-2">
            <button type="button" id="btn-tutorial-prev" class="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
              ◄ Sebelumnya
            </button>
            <button type="button" id="btn-tutorial-next" class="px-4 py-1.5 rounded-xl text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/30 transition-all cursor-pointer flex items-center gap-1 active:scale-95">
              <span id="tutorial-btn-next-label">Selanjutnya ►</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

