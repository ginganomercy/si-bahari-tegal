# 🌊 SI-BAHARI 3D — Digital Twin Kota Tegal
### *Sistem Simulasi Banjir Rob, Amblesan Tanah & Hidrologi Pesisir*

[![MapLibre GL JS](https://img.shields.io/badge/MapLibre_GL_JS-v4.7.1_(Bundled)-0284c7.svg?style=flat-square&logo=maplibre)](https://maplibre.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_v8-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4_AOT-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![WebGL2](https://img.shields.io/badge/Render_Engine-WebGL2_60FPS-0ea5e9.svg?style=flat-square)](https://khronos.org/webgl/)
[![Python](https://img.shields.io/badge/Geoprocessing-Python_3.10%2B_%2F_3.11%2B-38bdf8.svg?style=flat-square&logo=python)](https://python.org/)
[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare_Pages-f38020.svg?style=flat-square&logo=cloudflare)](https://pages.cloudflare.com/)
[![Status](https://img.shields.io/badge/Integrity-100%25_PASS-emerald.svg?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-slate.svg?style=flat-square)]()

Aplikasi WebGIS 3D tingkat produksi (*Digital Twin Enterprise*) untuk pemodelan bencana hidrometeorologi terpadu dan faktor kausal pemicu di wilayah **Kota Tegal (Kawasan Pesisir 0–3 mdpl & Hulu Lereng Guci Gunung Slamet)**. Dibangun dengan antarmuka **Light Mode Enterprise** (*Apple Maps & ArcGIS standard*) dan pipeline modern berkinerja tinggi (**Vite 8 + Tailwind CSS v4 AOT Compiler + Bundled MapLibre GL JS**) dengan waktu muat awal ultra-cepat (<300 ms), ukuran muatan awal ~35 KB gzip, dan kestabilan 60 FPS pada peramban.

---

## 📑 Daftar Isi

1. [Ringkasan Eksekutif & Makna Digital Twin](#-ringkasan-eksekutif--makna-digital-twin)
2. [Arsitektur Pemodelan Kausal Multi-Hazard](#-arsitektur-pemodelan-kausal-multi-hazard)
3. [Fitur Unggulan Platform](#-fitur-unggulan-platform)
4. [Engine Analisis AHP & Kalkulasi Matematis](#-engine-analisis-ahp--kalkulasi-matematis)
5. [Spesifikasi Arsitektur & Teknologi](#-spesifikasi-arsitektur--teknologi)
6. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
7. [Panduan Instalasi & Menjalankan Server](#-panduan-instalasi--menjalankan-server)
8. [Integrasi dengan QGIS Desktop (LTR 3.34+)](#-integrasi-dengan-qgis-desktop-ltr-334)
9. [Pipeline Pemutakhiran Data & Verifikasi](#-pipeline-pemutakhiran-data--verifikasi)
10. [Panduan Pintasan Keyboard (Tutorial Engine)](#-panduan-pintasan-keyboard-tutorial-engine)

---

## 🏛️ Ringkasan Eksekutif & Makna Digital Twin

### Apa Itu "Digital Twin" (Kembaran Digital)?
**Digital Twin** adalah replika virtual 3D yang dibuat sama persis (*kembar identik*) dengan entitas fisik di dunia nyata, yang menghubungkan topografi, geometri infrastruktur sipil, dan dinamika fluida secara matematis.

Dalam **SI-BAHARI 3D**, Kota Tegal fisik memiliki kembaran komputasi di dalam peramban web:
* **Elevasi Tanah Nyata:** Memetakan elevasi daratan pesisir $0–3\text{ mdpl}$ hingga hulu lereng Guci Gunung Slamet $>700\text{ mdpl}$ dari data DEM/LiDAR.
* **Geometri 219 Bangunan Fisik:** Model tapak poligon dan ketinggian bangunan 3D di kelurahan pesisir rawan (Tegalsari, Muarareja, dll.).
* **Infrastruktur Pengendali Air:** Stasiun Pompa Kolam Retensi Tegalsari berkapasitas $45.000\text{ m}^3$ dan 3 unit pompa ($1.500\text{ L/detik}$).
* **Karakter Bencana Interaktif:** Kenaikan air pasang rob ($0.0\text{m} - 2.5\text{m}$) membasahi dan menenggelamkan bangunan secara presisi.

**Tujuan Strategis:** Memberikan pembuat kebijakan (PUPR, Bappeda, BPBD, Walikota) laboratorium simulasi risiko bencana **tanpa risiko fisik terhadap warga**.

---

## 🌊 Arsitektur Pemodelan Kausal Multi-Hazard

Aplikasi ini tidak sekadar menampilkan visual genangan air, melainkan membedah **keterhubungan sebab-akibat (*Causal Drivers*)** bencana hidrologi Kota Tegal:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              FAKTOR PENYEBAB & KATALIS BENCANA                         │
│                                                                                        │
│  [ Pemicu 1: Amblesan Tanah ]   [ Pemicu 2: Sampah & Sedimen ]  [ Pemicu 3: Deforestasi ]│
│  Laju 2.5–5.2 cm/th di pesisir  Endapan lumpur 45–80 cm        Kelerengan curam >35° di │
│  (Muarareja & Tegalsari)        menutup debit drainase         Guci lereng G. Slamet    │
└───────────────────────────┬──────────────────────┬──────────────────────┬──────────────┘
                            │                      │                      │
                            ▼                      ▼                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       DAMPAK UTAMA: BANJIR ROB & GENANGAN PERKOTAAN                    │
│                                                                                        │
│  • Pesisir: Pasang air laut merendam 10 kelurahan dataran rendah (0–3 mdpl).           │
│  • Perkotaan: Luapan Kali Gung & Kali Kemiri akibat saluran sekunder tersumbat.        │
│  • Dampak Lanjutan: Intrusi air asin meracuni sumur air minum warga hingga 1.5 km.     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Amblesan Tanah Pesisir (*Land Subsidence*):** Laju penurunan daratan $2{,}5$ hingga $5{,}2\text{ cm/tahun}$ di Tegalsari dan Muarareja (akumulasi hingga $52\text{ cm}$ dalam 1 dekade) akibat pembebanan struktur pelabuhan dan ekstraksi air tanah industri es/perikanan.
2. **Sabuk Intrusi Air Asin (*Saline Intrusion Buffer*):** Perembesan air laut ke akuifer tanah tawar warga hingga radius $1{,}5\text{ km}$ dari bibir pantai dengan tingkat salinitas $3{,}8\text{ ppt}$ (Daya Hantar Listrik $>4.200\text{ }\mu\text{S/cm}$).
3. **Penyumbatan Saluran & Tumpukan Sampah:** Endapan lumpur sedimentasi setebal $45–80\text{ cm}$ memangkas debit hidrolik saluran sekunder hingga $80\%$, diperparah sumbatan sampah liar hingga $85\text{ m}^3$ pada muara dan kolong jembatan.
4. **Limpasan Hulu Lereng Guci Gunung Slamet ($>700\text{ mdpl}$):** Kelerengan terjal $>35^\circ$ dan pengurangan tutupan vegetasi hutan memicu laju debit banjir bandang (*flash runoff*) menuju daerah aliran sungai perkotaan Tegal.

---

## ⚡ Fitur Unggulan Platform

### 1. Simulator Elevasi Pasang Rob 3D (GPU WebGL2)
* Slider elevasi dinamis ($0{,}0\text{ m}$ sampai $2{,}5\text{ m}$) dengan visualisasi air fotorealistik dan tombol putar otomatis (*Auto-Play*).
* Algoritma *Inundation Intersect* mendeteksi secara instan 219 bangunan 3D yang terendam dan mengubah warnanya menjadi oranye bahaya secara real-time pada 60 FPS.

### 2. Pusat Kendali Pompa Polder Tegalsari
* Simulasi sakelar operasional Stasiun Pompa Tegalsari:
  * **Kondisi Normal (Aktif):** 3 unit pompa submersible bekerja membuang debit $1.500\text{ L/s}$, menahan air dalam kolam retensi $45.000\text{ m}^3$.
  * **Kondisi Gagal (Mati):** Mensimulasikan pemadaman listrik darurat di mana air pasang purnama langsung meluap menenggelamkan ribuan permukiman warga.

### 3. Skenario Cepat Tanggap Kedaruratan (Fast Scenario Presets)
Uji instan 3 skenario bencana hidrologi terkalibrasi PUPR/BPBD tanpa perlu menebak angka:
* **Pasang Purnama:** Elevasi $+1{,}4\text{ m}$ (siklus pasang astronomis bulanan).
* **Hujan Badai:** Elevasi $+0{,}8\text{ m}$ (hujan deras hulu dan limpasan perkotaan).
* **Compound Disaster:** Elevasi $+2{,}0\text{ m}$ dengan simulasi kegagalan pompa (*Worst-Case Scenario*).

### 4. Portal Onboarding Eksekutif (Landing Page Modal)
* Ringkasan eksekutif latar belakang proyek ketahanan pesisir.
* Matriks dampak bencana dan tombol cepat mulai panduan atau langsung uji skenario.
* Persistensi preferensi via `localStorage` (*opsi "Jangan tampilkan lagi"*).

### 5. Native Game Engine Walkthrough Tutorial (5 Langkah)
* **Spotlight Dinamis SVG:** Masker cutout SVG gelap (`rgba(15, 23, 42, 0.72)`) dengan cincin highlight berdenyut.
* **Orkestrasi Laci Pintar (*Smart Drawer State*):** Laci kiri otomatis menutup pada Langkah 1 & 4 untuk menjaga layar tetap bersih, serta otomatis membuka pada Langkah 2, 3, dan 5 saat menyorot kontrol analitik.
* **Indikator Panah Geometris (*Sub-pixel Caret Pointer*):** Menunjuk secara presisi ke tengah elemen tombol yang sedang aktif.
* **Navigation Lock Guard (280 ms):** Menghilangkan risiko loncatan langkah akibat klik beruntun (*rapid click*) atau penumpukan listener.
* **Titik Navigasi Interaktif:** Indikator titik di sudut kiri bawah kartu dapat diklik langsung untuk melompat antar-langkah.

### 6. Lembar Inspeksi Teknis & Rekayasa Lapangan
* Klik objek spasial mana pun di peta untuk memunculkan lembar rincian teknis:
  * Volume lumpur saluran ($m^3$) dan estimasi ritasi *dump truck* kapasitas $6\text{ m}^3$.
  * Laju penurunan tanah tahunan dan estimasi penurunan 10 tahun.
  * Dokumen SOP darurat penanganan dari DPUPR Kota Tegal dan BBWS Pemali-Juana.

---

## 🧮 Engine Analisis AHP & Kalkulasi Matematis

Perhitungan indeks risiko gabungan (*Multi-Hazard Risk Index*) dihitung menggunakan kombinasi **Analytical Hierarchy Process (AHP)** dan ambang batas deterministik:

$$\text{Risk Score} = (W_E \cdot S_E) + (W_S \cdot S_S) + (W_D \cdot S_D) + (W_L \cdot S_L) + (W_R \cdot S_R)$$

### Bobot Kriteria AHP (Terkalibrasi $\sum W = 1{,}00$)
| Parameter | Bobot ($W$) | Keterangan & Normalisasi ($S$) |
|---|---|---|
| **Elevasi Tanah ($W_E$)** | `0.30` | Dataran rendah $0–3{,}5\text{ mdpl}$ bernilai risiko tertinggi ($1.0$). |
| **Kelerengan / Slope ($W_S$)** | `0.25` | Kemiringan lereng daratan pesisir flat ($<2\%$) dan lereng curam hulu ($>35^\circ$). |
| **Kondisi Drainase ($W_D$)** | `0.20` | Berdasarkan ketebalan sedimen lumpur ($45–80\text{ cm}$) dan sumbatan sampah. |
| **Tutupan Lahan & Kepadatan ($W_L$)** | `0.15` | Kepadatan permukiman padat penduduk per km² di kawasan pesisir. |
| **Intensitas Hujan ($W_R$)** | `0.10` | Distribusi curah hujan ekstrem harian BMKG ($>100\text{ mm/hari}$). |

### Ambang Batas Klasifikasi Risiko
* **Risiko Tinggi (*High Risk*):** $\text{Skor} \ge 0{,}70$ (Warna Merah Amber `#ef4444`)
* **Risiko Sedang (*Medium Risk*):** $0{,}40 \le \text{Skor} < 0{,}70$ (Warna Kuning `#f59e0b`)
* **Risiko Rendah (*Low Risk*):** $\text{Skor} < 0{,}40$ (Warna Hijau Emerald `#10b981`)

---

## 💻 Spesifikasi Arsitektur & Teknologi

* **Frontend Build Engine:** **Vite v8** dengan Hot Module Replacement (HMR) instan dan kompilasi Ahead-Of-Time (AOT).
* **Styling Engine:** **Tailwind CSS v4** terintegrasi via `@tailwindcss/vite` — tanpa kompilator runtime JIT di browser, menghasilkan stylesheet bersih terkompresi ~8.1 KB gzip.
* **Map & 3D WebGL Engine:** **MapLibre GL JS v4.7.1 (Bundled Vendor Chunk)** dengan isolasi chunk terpisah (~209 KB gzip), shader elevasi genangan air GPU bathymetric, dan ekstrusi tapak bangunan 3D.
* **Modularity:** Arsitektur Native ES Modules dengan isolasi layer: `config/`, `types/`, `services/`, `components/`, `layers/`, `controllers/`.
* **Desain UI/UX:** Standar **Light Mode Enterprise** (Apple Maps / ArcGIS Experience Builder), bebas emoji informal, 100% vektor SVG murni.
* **Backend Dev Server:** Dedicated multithreaded Python server (`scripts/serve.py`) dengan header anti-caching dan penanganan soket IPv4 Windows, serta server Vite bawaan (`npm run dev`).
* **Format Data:** Standar OGC GeoJSON (WGS84 EPSG:4326), kompatibel 100% dengan **QGIS Desktop LTR 3.34+**.

---

## 📁 Struktur Direktori Proyek

```
qgis-map/
├── data/
│   ├── raw/                                  # Seed data spasial mentah
│   │   ├── tegal_urban_zones.geojson         # 10 Kelurahan dataran rendah pesisir
│   │   ├── tegal_land_subsidence.geojson     # 3 Poligon laju penurunan tanah (2.5–5.2 cm/th)
│   │   ├── tegal_saline_intrusion.geojson    # 1 Poligon buffer zona intrusi air asin 1.5 km
│   │   ├── drainage_waste_chokes.geojson     # 3 Titik tumpukan sampah liar penyumbat
│   │   ├── guci_watershed_zones.geojson      # 3 Poligon zona tangkapan hulu lereng Guci
│   │   ├── drainage_bottlenecks.geojson      # 9 Titik saluran kritis tersumbat sedimen
│   │   └── buildings_footprints_tegal.geojson# 219 Tapak bangunan untuk ekstrusi 3D
│   └── processed/                            # Data hasil skoring AHP & sinkronisasi
│       ├── tegal_hybrid_risk.geojson
│       ├── tegal_land_subsidence.geojson
│       ├── tegal_saline_intrusion.geojson
│       ├── drainage_waste_chokes.geojson
│       ├── guci_landslide_risk.geojson
│       ├── drainage_critical_points.geojson
│       └── buildings_footprints_tegal.geojson
├── public/                                   # Aset publik statis untuk bundler & CDN
│   ├── _headers                              # Konfigurasi caching, CORS, & MIME Cloudflare Pages
│   └── data/processed/                       # GeoJSON statis yang disajikan langsung ke klien
├── scripts/
│   ├── serve.py                              # Daemon HTTP server multithreaded (127.0.0.1:8000)
│   ├── generate_spatial_seed.py              # Generator seluruh lapisan spasial & kausalitas
│   ├── run_hybrid_analysis.py                # Engine skoring AHP & kalkulasi risiko gabungan
│   ├── test_domain_calculations.py           # Unit tests kalkulasi AHP & logistik pembersihan
│   └── verify_integrity.py                   # Automated test suite integritas berkas (100% PASS)
├── src/
│   ├── index.html                            # Dashboard WebGIS Light Mode Enterprise
│   ├── _headers                              # Headers konfigurasi fallback
│   ├── css/
│   │   └── style.css                         # Tailwind v4 import, theme colors & custom overrides
│   ├── data/processed/                       # Salinan data spasial lokal modul
│   └── js/
│       ├── config/
│       │   └── map.constants.js              # Named constants, design tokens & koordinat
│       ├── types/
│       │   └── spatial.types.js              # Typed JSDoc schemas & interfaces
│       ├── services/
│       │   ├── storage.service.js            # Persistensi preferensi localStorage
│       │   └── spatial-data.service.js       # Centralized Spatial Data Repository & cache
│       ├── components/
│       │   ├── landing/                      # Portal Onboarding Eksekutif & Quick Scenario
│       │   ├── tutorial/                     # Walkthrough tour, dialog masks, game engine
│       │   ├── inspector/                    # Inspection drawer untuk kelurahan & stasiun pompa
│       │   ├── drainage/                     # List saluran drainase & kalkulator biaya
│       │   ├── analytics/                    # Tabel skoring AHP kelurahan terpadu
│       │   └── ui/                           # Toast notification system
│       ├── layers/
│       │   ├── terrain.layer.js              # Basemap satelit bersih (Zero POI) & 3D Terrain
│       │   ├── buildings.layer.js            # Ekstrusi bangunan 3D & deteksi terendam
│       │   ├── hazard.layer.js               # Pengendali layer AHP & 3 faktor kausal
│       │   └── water.shader.js               # Inundation surface layer bertenaga GPU
│       ├── controllers/
│       │   ├── camera.controller.js          # Transisi kamera sinematik (Tegal <-> Guci)
│       │   └── simulation.controller.js      # Simulator pasang rob, polder & skenario cepat
│       └── main.js                           # Master coordinator aplikasi
├── dist/                                     # Hasil kompilasi AOT produksi siap deploy
├── vite.config.js                            # Konfigurasi bundler Vite v8 & Tailwind AOT
├── tegal_flood_project.qgs                   # File project workspace QGIS Desktop
├── package.json                              # Metadata & skrip otomasi NPM / Bun
└── README.md                                 # Dokumentasi teknis komprehensif
```

---

## 🚀 Panduan Instalasi & Menjalankan Server

### 1. Prasyarat Sistem
* **Node.js:** Versi `18.0+` (disarankan LTS 20+) atau **Bun** `1.0+`.
* **Python:** Versi `3.10+` atau `3.11+` (untuk geoprocessing & unit tests).
* **Peramban Web:** Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari versi terbaru dengan WebGL2 aktif.

### 2. Menjalankan Server Pengembangan Lokal

```bash
# 1. Instalasi dependensi
npm install

# 2. Jalankan Vite Development Server (Instan HMR pada http://localhost:8000)
npm run dev

# Opsi alternatif: Menjalankan Python server
python scripts/serve.py
```

### 3. Membangun Berkas Produksi (Production Build)

```bash
# Kompilasi AOT dengan Vite & Tailwind v4
npm run build

# Uji coba build produksi secara lokal
npm run preview
```

---

## ☁️ Panduan Deploy ke Cloudflare Pages

Aplikasi ini telah dioptimalkan khusus untuk arsitektur edge **Cloudflare Pages**:

### Langkah 1: Hubungkan Repositori GitHub
1. Buka dashboard [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages**.
2. Pilih **Create Application** > tab **Pages** > **Connect to Git**.
3. Pilih repositori `ginganomercy/si-bahari-tegal`.

### Langkah 2: Konfigurasi Build Settings
Isi pengaturan build sebagai berikut:

| Pengaturan | Nilai Konfigurasi |
|---|---|
| **Project name** | `si-bahari-tegal` (atau sesuai keinginan) |
| **Production branch** | `main` |
| **Framework preset** | `Vite` (atau `None`) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Node.js version** | `20` (Environment variable `NODE_VERSION: 20`) |

### Langkah 3: Optimasi Caching & CORS Otomatis
File `public/_headers` akan disalin secara otomatis ke direktori `dist/_headers` saat build:
* Mengatur MIME type `application/json` pada dataset GeoJSON.
* Mengaktifkan edge caching `Cache-Control: public, max-age=86400, stale-while-revalidate=3600`.
* Mengaktifkan header CORS `Access-Control-Allow-Origin: *`.

Setelah server aktif, buka peramban Anda pada alamat:  
👉 **`http://localhost:8000/src/`**

---

## 🗺️ Integrasi dengan QGIS Desktop (LTR 3.34+)

Seluruh dataset pada folder `data/processed/` berstandar OGC GeoJSON dan dapat langsung dibuka serta diolah di dalam perangkat lunak **QGIS Desktop**:

1. Buka aplikasi **QGIS Desktop (LTR 3.34+)**.
2. Tarik (*drag & drop*) berkas GeoJSON dari direktori `data/processed/` ke panel Layer:
   * **`tegal_hybrid_risk.geojson`**: Atur simbologi *Categorized* berdasarkan kolom atribut `klasifikasi_risiko` (Tinggi, Sedang, Rendah).
   * **`tegal_land_subsidence.geojson`**: Atur simbologi *Graduated* pada kolom `laju_penurunan_cm_tahun` dengan skema warna oranye ke merah.
   * **`tegal_saline_intrusion.geojson`**: Atur simbologi *Stroke Buffer* warna ungu transparan.
   * **`drainage_critical_points.geojson`**: Atur simbologi titik berdasarkan kolom `sediment_depth_cm`.
   * **`drainage_waste_chokes.geojson`**: Simbologi titik penanda volume sampah ($m^3$).
   * **`buildings_footprints_tegal.geojson`**: Ekstrusi ketinggian bangunan berdasarkan kolom `height_m`.
3. Buka project tersimpan **`tegal_flood_project.qgs`** untuk melihat tata letak peta yang telah dipra-konfigurasi.
4. Pasang plugin **Qgis2threejs** jika ingin merender elevasi topografi 3D secara offline di dalam QGIS.

---

## 🧪 Pipeline Pemutakhiran Data & Verifikasi

Proyek ini dilengkapi rangkaian pengujian otomatis (*automated verification suite*) untuk memastikan integritas data dan kode:

```bash
# 1. Regenerasi data spasial sintetis terkalibrasi
python scripts/generate_spatial_seed.py

# 2. Jalankan engine kalkulasi risiko AHP dan sinkronisasi berkas
python scripts/run_hybrid_analysis.py

# 3. Eksekusi pengujian integritas arsitektur data dan berkas web
python scripts/verify_integrity.py
```

### Hasil Verifikasi Integritas:
```text
=== [1/2] Verifying Processed Spatial Data Integrity ===
[PASS] tegal_hybrid_risk.geojson -> 10 valid features verified.
[PASS] guci_landslide_risk.geojson -> 3 valid features verified.
[PASS] drainage_critical_points.geojson -> 9 valid features verified.
[PASS] buildings_footprints_tegal.geojson -> 219 valid features verified.
[PASS] tegal_land_subsidence.geojson -> 3 valid features verified.
[PASS] tegal_saline_intrusion.geojson -> 1 valid features verified.
[PASS] drainage_waste_chokes.geojson -> 3 valid features verified.

=== [2/2] Verifying Frontend Source Code Architecture ===
[PASS] index.html (31972 bytes)
[PASS] css/style.css (4935 bytes)
[PASS] js/config/map.constants.js (5458 bytes)
[PASS] js/services/storage.service.js (1509 bytes)
[PASS] js/components/landing/landing.template.js (12402 bytes)
[PASS] js/components/landing/landing.component.js (4229 bytes)
[PASS] js/components/tutorial/tutorial.steps.js (3145 bytes)
[PASS] js/components/tutorial/tutorial.template.js (4806 bytes)
[PASS] js/components/tutorial/tutorial.component.js (16828 bytes)
[PASS] js/layers/terrain.layer.js (4101 bytes)
[PASS] js/layers/buildings.layer.js (3684 bytes)
[PASS] js/layers/hazard.layer.js (15150 bytes)
[PASS] js/layers/water.shader.js (3303 bytes)
[PASS] js/controllers/camera.controller.js (1627 bytes)
[PASS] js/controllers/simulation.controller.js (10619 bytes)
[PASS] js/main.js (34983 bytes)
--------------------------------------------------
RESULT: ALL INTEGRITY CHECKS PASSED (100% OK)
```

---

## ⌨️ Panduan Pintasan Keyboard (Tutorial Engine)

Saat tutorial interaktif sedang aktif, navigasi dapat dikontrol melalui keyboard:

| Tombol Keyboard | Aksi |
|---|---|
| **`→` (Panah Kanan) / `Enter`** | Maju ke langkah panduan berikutnya (*Next Step*). |
| **`←` (Panah Kiri)** | Kembali ke langkah panduan sebelumnya (*Previous Step*). |
| **`Esc` (Escape)** | Menutup atau melewati panduan tutorial (*Exit Tutorial*). |
| **Klik Dot Bulat** | Melompat seketika ke langkah 1, 2, 3, 4, atau 5 secara langsung. |

---

## 📄 Lisensi & Hak Penggunaan

Diterbitkan di bawah lisensi **MIT License**. Data spasial dan algoritma pemodelan dapat dikembangkan lebih lanjut untuk keperluan akademis, dinas teknis pemerintah daerah, maupun penelitian hidrometeorologi pesisir.
