/**
 * @file map.constants.js
 * @description Centralized configuration, clean HD basemaps (No commercial POIs), and named constants for Tegal 3D WebGIS 2.0.
 */

export const CAMERA_PRESETS = Object.freeze({
  KOTA_TEGAL: {
    name: 'Kawasan Pesisir & Dataran Rendah (Kota Tegal)',
    center: [109.1256, -6.8650],
    zoom: 14.2,
    pitch: 45.0,
    bearing: -12.0,
    altitudeRangeMeters: { min: 0.0, max: 5.0 }
  },
  GUCI_BUMIJAWA: {
    name: 'Kawasan Hulu & Lereng Gunung Slamet (Guci)',
    center: [109.1650, -7.1900],
    zoom: 13.2,
    pitch: 48.0,
    bearing: 30.0,
    altitudeRangeMeters: { min: 700.0, max: 1450.0 }
  }
});

/**
 * Clean High-Definition Basemaps (Excludes Commercial Shop/Business POIs)
 */
export const BASEMAP_CONFIG = Object.freeze({
  GOOGLE_SATELLITE: {
    id: 'google-satellite',
    name: 'Citra Satelit HD Murni (Bersih)',
    // lyrs=s provides pure aerial satellite photogrammetry with ZERO commercial shop POIs or business pins
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Satellite Imagery',
    maxzoom: 21
  },
  ESRI_SATELLITE: {
    id: 'esri-satellite',
    name: 'Satelit Global (ESRI)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxzoom: 19
  },
  STREET: {
    id: 'carto-voyager',
    name: 'Peta Jalan Administrasi (OSM)',
    url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxzoom: 19
  },
  DARK: {
    id: 'carto-dark',
    name: 'Mode Gelap (CARTO)',
    url: 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
    attribution: '&copy; CARTO, OpenStreetMap contributors',
    maxzoom: 19
  }
});

export const WATER_SIMULATION_CONFIG = Object.freeze({
  MIN_ELEVATION_M: 0.0,
  MAX_ELEVATION_M: 2.5,
  STEP_INCREMENT_M: 0.1,
  DEFAULT_ELEVATION_M: 0.0, // Clean dry baseline
  TIDAL_SPRING_HIGH_WATER_M: 1.4,
  EXTREME_DISASTER_LEVEL_M: 2.0,
  AUTO_PLAY_INTERVAL_MS: 160,
  AUTO_PLAY_STEP_M: 0.05
});

export const DRAINAGE_THRESHOLDS = Object.freeze({
  MIN_SEDIMENT_CM: 45.0,
  MAX_SEDIMENT_CM: 80.0,
  CRITICAL_SEVERITY_CM: 60.0,
  STANDARD_CHANNEL_DEPTH_CM: 100.0
});

export const RISK_COLOR_PALETTE = Object.freeze({
  LOW: '#22c55e',
  MEDIUM: '#eab308',
  HIGH: '#ef4444',
  CRITICAL: '#7f1d1d',
  WATER_SURFACE: '#0284c7',
  BUILDING_DEFAULT: '#cbd5e1',
  BUILDING_AFFECTED: '#dc2626'
});

/**
 * Enterprise Light Mode Design Tokens (Apple Maps / ArcGIS Experience Builder standard)
 */
export const LIGHT_THEME_TOKENS = Object.freeze({
  BG_CANVAS: '#f8fafc',
  BG_SURFACE: 'rgba(255, 255, 255, 0.95)',
  BG_CARD: '#ffffff',
  BG_CARD_HOVER: '#f1f5f9',
  BORDER_SUBTLE: '#e2e8f0',
  BORDER_ACTIVE: '#0284c7',
  TEXT_HEADING: '#0f172a',
  TEXT_BODY: '#334155',
  TEXT_MUTED: '#64748b',
  ACCENT_BRAND: '#0284c7',
  STATUS: {
    SAFE: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    ALERT_3: { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' },
    ALERT_2: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
    ALERT_1: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }
  }
});

/**
 * Causal Hazard Thresholds and Symbolic Tokens
 */
export const CAUSAL_HAZARD_CONSTANTS = Object.freeze({
  LAND_SUBSIDENCE: {
    HIGH_RATE_CM_YR: 4.8,
    MEDIUM_RATE_CM_YR: 2.8,
    CRITICAL_ELEVATION_THRESHOLD_M: 1.0,
    COLOR_FILL: '#9333ea', // Purple-600
    COLOR_BORDER: '#7e22ce'
  },
  SALINE_INTRUSION: {
    MAX_INLAND_BUFFER_KM: 1.5,
    THRESHOLD_SALINITY_PPT: 2.5,
    COLOR_FILL: '#f59e0b', // Amber-500
    COLOR_BORDER: '#d97706'
  },
  SOLID_WASTE_BOTTLENECKS: {
    CRITICAL_VOLUME_M3: 50.0,
    DOMESTIC_PLASTIC_RATIO_PCT: 65.0,
    COLOR_MARKER: '#ea580c' // Orange-600
  }
});

/**
 * Polder Pump Station & Retention Basin Engineering Configuration
 */
export const POLDER_PUMP_CONFIG = Object.freeze({
  STATION_NAME: 'Stasiun Pompa Polder Kolam Retensi Tegalsari',
  PUMP_UNITS: 3,
  UNIT_CAPACITY_L_S: 500.0,
  TOTAL_CAPACITY_L_S: 1500.0,
  RETENTION_BASIN_VOLUME_M3: 45000.0,
  PROTECTION_THRESHOLD_ELEVATION_M: 1.6, // Polder dyke protects up to +1.6 mdpl
  PROTECTED_KELURAHAN_LIST: ['Tegalsari', 'Muarareja']
});

/**
 * Fast Disaster Presets (Civil Engineering Scenarios)
 */
export const DISASTER_SCENARIOS = Object.freeze({
  SPRING_TIDE: {
    id: 'SPRING_TIDE',
    name: 'Pasang Purnama',
    elevationMeters: 1.4,
    pumpActive: true,
    badgeText: 'PASANG PURNAMA (+1.4m)',
    description: 'Pasang astronomis laut Jawa puncak purnama. Pompa polder aktif memompa air balik ke laut.'
  },
  EXTREME_RAIN: {
    id: 'EXTREME_RAIN',
    name: 'Hujan Lokal Ekstrem',
    elevationMeters: 0.8,
    pumpActive: true,
    badgeText: 'HUJAN EKSTREM (+0.8m)',
    description: 'Curah hujan badai intensitas 120 mm/hari. Saluran perkotaan terhambat sedimentasi lumpur.'
  },
  COMPOUND_FLOOD: {
    id: 'COMPOUND_FLOOD',
    name: 'Compound Flood',
    elevationMeters: 2.0,
    pumpActive: false,
    badgeText: 'COMPOUND DISASTER (+2.0m)',
    description: 'Skenario terburuk: Pasang rob ekstrem + tanggul jebol + stasiun pompa polder padam total.'
  }
});

export const WEBGL_CONFIG = Object.freeze({
  TERRAIN_EXAGGERATION: 1.25,
  BUILDING_BASE_HEIGHT_M: 3.5,
  WAVE_ANIMATION_SPEED: 0.002,
  WATER_OPACITY: 0.70
});
