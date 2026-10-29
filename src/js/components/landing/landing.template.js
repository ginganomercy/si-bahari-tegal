/**
 * @file landing.template.js
 * @description Markup template for SI-BAHARI 3D Onboarding & Executive Briefing Portal.
 * Pure SVG Heroicons, Light Mode Enterprise tokens, and responsive multi-column layout.
 */

export function renderLandingTemplate() {
  return `
    <div id="landing-overlay" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
      <div class="relative w-full max-w-4xl max-h-[92vh] bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        <!-- Top Modal Bar -->
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M3 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/></svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-base sm:text-lg font-black tracking-tight text-slate-900">SI-BAHARI 3D</h1>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 uppercase tracking-wide">Digital Twin Kota Tegal</span>
              </div>
              <p class="text-xs text-slate-500 font-medium">Sistem Simulasi Banjir Rob, Amblesan Tanah & Hidrologi Pesisir</p>
            </div>
          </div>
          
          <button type="button" id="btn-close-landing" class="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-sm" title="Tutup Panduan (Esc)">
            <svg class="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Scrollable Content Body -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 custom-scrollbar text-slate-700">
          
          <!-- Executive Hero Summary -->
          <div class="bg-gradient-to-br from-sky-50/80 to-slate-50 border border-sky-100 rounded-xl p-4 sm:p-5">
            <h2 class="text-sm sm:text-base font-extrabold text-slate-900 mb-1.5 flex items-center gap-2">
              <svg class="w-4 h-4 text-sky-600 stroke-current shrink-0" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <span>Platform Simulasi Ketahanan Pesisir & Pengendalian Banjir Terpadu</span>
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              SI-BAHARI 3D memodelkan replika digital (*Digital Twin*) hidrometeorologi Kota Tegal secara holistik. Sistem ini menghubungkan dinamika pasang surut air laut di dataran rendah (0–3 mdpl) dengan fenomena <strong>amblesan tanah</strong>, <strong>intrusi air asin</strong>, <strong>sedimentasi saluran drainase</strong>, serta limpasan curam dari kawasan hulu <strong>lereng Guci Gunung Slamet</strong>.
            </p>
          </div>

          <!-- 3 Kartu Pilar Masalah Sistemik Tegal -->
          <div class="space-y-2.5">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
              <span>3 Pilar Kausalitas Masalah Sistemik Wilayah</span>
              <span class="text-[11px] text-slate-500 font-normal">Data Hidrologi & Geologi</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <!-- Pilar 1: Amblesan & Intrusi -->
              <div class="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-sm hover:border-purple-300 transition-all">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                  </div>
                  <h3 class="text-xs font-bold text-slate-900">Amblesan & Intrusi</h3>
                </div>
                <p class="text-[11px] text-slate-600 leading-relaxed">
                  Laju penurunan tanah pesisir Tegalsari & Muarareja mencapai <strong>2.5–5.2 cm/th</strong>. Air asin menyusup hingga <strong>1.5 km</strong> mencemari air sumur warga.
                </p>
                <div class="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block">
                  Akumulasi 10th: 52 cm
                </div>
              </div>

              <!-- Pilar 2: Rob & Drainase Macet -->
              <div class="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-sm hover:border-sky-300 transition-all">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-md bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/></svg>
                  </div>
                  <h3 class="text-xs font-bold text-slate-900">Pasang Rob & Sedimen</h3>
                </div>
                <p class="text-[11px] text-slate-600 leading-relaxed">
                  Pasang air laut merendam kelurahan 0–3 mdpl. Saluran sekunder terhambat endapan lumpur tebal <strong>45–80 cm</strong> dan 3 titik sumbatan sampah liar.
                </p>
                <div class="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block">
                  9 Titik Saluran Kritis
                </div>
              </div>

              <!-- Pilar 3: Hulu Lereng Guci -->
              <div class="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-sm hover:border-rose-300 transition-all">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21l8-16 8 16H3zM9 21l3-6 3 6"/></svg>
                  </div>
                  <h3 class="text-xs font-bold text-slate-900">Hulu Lereng G. Slamet</h3>
                </div>
                <p class="text-[11px] text-slate-600 leading-relaxed">
                  Kelerengan curam <strong>>35°</strong> di kawasan Guci Bumijawa (>700 mdpl) mempercepat laju banjir bandang dan debris flow menuju dataran hilir Kota Tegal.
                </p>
                <div class="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                  Hujan Badai: 180 mm/hari
                </div>
              </div>
            </div>
          </div>

          <!-- 3 Langkah Panduan Penggunaan Interaktif -->
          <div class="space-y-2.5">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-800">
              Panduan 3 Langkah Eksplorasi Digital Twin
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div class="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span class="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                <div>
                  <div class="font-bold text-slate-900">Pilih Zona Wilayah</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">Gunakan switcher di bar atas untuk berpindah antara Pesisir Kota Tegal dan Hulu Guci.</div>
                </div>
              </div>

              <div class="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span class="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-black flex items-center justify-center shrink-0">2</span>
                <div>
                  <div class="font-bold text-slate-900">Uji Skenario & Pompa</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">Geser slider elevasi air atau klik skenario cepat & kendalikan operasi pompa polder 1.500 L/s.</div>
                </div>
              </div>

              <div class="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span class="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-black flex items-center justify-center shrink-0">3</span>
                <div>
                  <div class="font-bold text-slate-900">Buka Lembar Teknis</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">Klik pada poligon kelurahan, amblesan, atau titik saluran untuk lembar inspeksi SOP PUPR.</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Bottom Action Bar (CTA) -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <label class="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
            <input type="checkbox" id="check-dont-show-landing" class="w-4 h-4 rounded text-sky-600 accent-sky-600 cursor-pointer">
            <span>Jangan tampilkan lagi pembukaan ini otomatis</span>
          </label>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button type="button" id="btn-landing-tutorial" class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm" title="Panduan Tutorial Langkah-demi-Langkah">
              <svg class="w-3.5 h-3.5 text-sky-600 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              <span>Tutorial Fitur</span>
            </button>
            <button type="button" id="btn-landing-quick-scenario" class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
              <svg class="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>Uji Pasang (+1.4m)</span>
            </button>
            <button type="button" id="btn-landing-explore" class="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20">
              <span>Jelajahi Peta 3D</span>
              <svg class="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

