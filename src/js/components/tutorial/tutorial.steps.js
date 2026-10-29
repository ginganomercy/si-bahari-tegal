/**
 * @file tutorial.steps.js
 * @description Master configuration for SI-BAHARI 3D Interactive Walkthrough Tour.
 * Defines target DOM selectors, camera coordinates, explanatory copy, and drawer tab activations.
 */

export const TUTORIAL_STEPS = Object.freeze([
  {
    stepIndex: 1,
    title: 'Radar Pemilihan Wilayah Analisis',
    category: 'NAVIGASI WILAYAH',
    description: 'Beralih seketika antara dua lanskap kunci: Kawasan Pesisir Kota Tegal (0–3 mdpl) yang rentan pasang rob, dan Kawasan Hulu Lereng Guci Gunung Slamet (>700 mdpl) pemicu debit limpasan badai.',
    targetSelector: '#btn-zone-tegal',
    cameraPreset: 'KOTA_TEGAL',
    preferredPosition: 'bottom',
    drawerTab: null,
    actionHint: 'Pilih zona pesisir atau hulu lereng'
  },
  {
    stepIndex: 2,
    title: 'Skenario Cepat Tanggap Kedaruratan',
    category: 'SIMULASI BENCANA',
    description: 'Uji 3 skenario bencana hidrologi terkalibrasi tanpa perlu menebak angka: Pasang Purnama (+1.4m), Hujan Badai (+0.8m), dan Compound Disaster (+2.0m + Pompa Mati).',
    targetSelector: '#container-scenario-presets',
    cameraCoordinates: [109.1350, -6.8530],
    cameraZoom: 14.5,
    cameraPitch: 42.0,
    preferredPosition: 'right',
    drawerTab: 'tab-analytics',
    actionHint: 'Klik salah satu skenario untuk pengujian instan'
  },
  {
    stepIndex: 3,
    title: 'Pusat Kendali Pompa Polder Tegalsari',
    category: 'INFRASTRUKTUR MITIGASI SIPIL',
    description: 'Benteng pertahanan utama kota! Kolam retensi berkapasitas 45.000 m³ dengan 3 unit pompa (1.500 L/s). Matikan sakelar ini saat pasang rob untuk melihat simulasi luapan air menenggelamkan ribuan pemukiman jika listrik padam.',
    targetSelector: '#polder-pump-card',
    cameraCoordinates: [109.1350, -6.8530],
    cameraZoom: 16.0,
    cameraPitch: 50.0,
    preferredPosition: 'right',
    drawerTab: 'tab-analytics',
    actionHint: 'Uji keandalan pompa normal vs gagal'
  },
  {
    stepIndex: 4,
    title: 'Simulator Elevasi Pasang Rob 3D',
    category: 'SIMULATOR DINAMIS GPU',
    description: 'Geser slider ini dari 0.0m ke 2.5m atau tekan tombol Putar Otomatis. Mesin grafis WebGL2 memvisualisasikan permukaan air laut menenggelamkan 219 bangunan 3D di peta secara fotorealistik pada 60 FPS.',
    targetSelector: '#panel-water-simulation',
    cameraCoordinates: [109.1256, -6.8650],
    cameraZoom: 14.8,
    cameraPitch: 48.0,
    preferredPosition: 'top',
    drawerTab: null,
    actionHint: 'Geser slider untuk melihat kenaikan air laut'
  },
  {
    stepIndex: 5,
    title: 'Lembar Inspeksi Teknis & Bukti Kausalitas',
    category: 'DATA REKAYASA & KEPUTUSAN',
    description: 'Klik objek apapun di peta (kelurahan, titik sedimen saluran sekunder, tumpukan sampah, atau zona penurunan tanah) untuk membuka lembar spesifikasi teknis: volume lumpur, rit dump truck, dan SOP penanganan darurat PUPR.',
    targetSelector: '#btn-tab-drainage',
    cameraCoordinates: [109.1280, -6.8680],
    cameraZoom: 16.2,
    cameraPitch: 45.0,
    preferredPosition: 'right',
    drawerTab: 'tab-drainage',
    actionHint: 'Akses data teknis dan matriks darurat PUPR'
  }
]);

