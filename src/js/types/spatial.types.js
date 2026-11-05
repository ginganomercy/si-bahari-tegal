/**
 * @file spatial.types.js
 * @description Formal JSDoc Type Definitions & Domain Contracts for SI-BAHARI 3D.
 * Provides IDE autocompletion, type safety, and clean documentation for spatial features.
 */

/**
 * @typedef {Object} DrainageFeatureProperties
 * @property {string} id_titik Primary identifier
 * @property {string} lokasi Channel street/crossing name
 * @property {string} kelurahan Administrative kelurahan
 * @property {number} sediment_depth_cm Sediment thickness in centimeters (45-80 cm)
 * @property {number} lebar_saluran_m Existing channel width in meters
 * @property {number} kedalaman_saluran_m Existing channel depth in meters
 * @property {number} volume_sedimen_m3 Volume of accumulated silt in cubic meters
 * @property {number} ritase_dump_truck Number of 6m³ dump truck trips required
 * @property {number} debit_eksisting_m3s Current hydraulic discharge capacity (m³/s)
 * @property {number} debit_rencana_m3s Original design discharge capacity (m³/s)
 * @property {number} capacity_loss_pct Percentage of flow reduction
 * @property {number} kk_terdampak Exposed household count
 * @property {number} estimasi_kerugian_juta_rp Economic loss potential in million Rupiah
 * @property {string} tingkat_kegawatan Severity label (KRITIS / WASPADA)
 * @property {string} sop_alat_berat Required heavy machinery (Excavator Long Arm, etc.)
 * @property {number} durasi_pengerjaan_hari Estimated cleanup duration in working days
 * @property {string} instansi_penanggung_jawab Responsible agency (DPUPR Kota Tegal)
 * @property {string} clogging_source Primary sediment source
 */

/**
 * @typedef {Object} WasteFeatureProperties
 * @property {string} id_choke Solid waste bottleneck ID
 * @property {string} lokasi Choke point location
 * @property {string} kelurahan Administrative kelurahan
 * @property {number} estimasi_volume_m3 Solid waste accumulation in cubic meters
 * @property {string} karakteristik_sampah Waste composition (Plastik, Bambu, Eceng Gondok)
 * @property {string} dampak_hidrologi Flow obstruction impact
 * @property {string} rekomendasi_aksi Recommended action
 */

/**
 * @typedef {Object} SubsidenceFeatureProperties
 * @property {string} id_subsidence Subsidence polygon ID
 * @property {string} nama_zona Subsidence zone name
 * @property {number} laju_penurunan_cm_tahun Subsidence rate in cm/year (2.5 - 5.2 cm/th)
 * @property {number} akumulasi_penurunan_10th_cm 10-year projected subsidence in cm
 * @property {string} tingkat_urgensi Urgency rating (SANGAT TINGGI)
 * @property {string} formasi_geologi Geological soil formation
 * @property {string} faktor_penyebab Underlying drivers
 * @property {string} rekomendasi_mitigasi Recommended civil mitigation
 */

/**
 * @typedef {Object} SalineFeatureProperties
 * @property {string} id_saline Saline intrusion buffer ID
 * @property {string} nama_zona Zone name
 * @property {number} buffer_radius_km Coastal buffer distance in kilometers (1.5 km)
 * @property {number} salinitas_air_tanah_ppt Groundwater salinity in parts per thousand
 * @property {number} daya_hantar_listrik_us_cm Electrical conductivity (µS/cm)
 * @property {string} status_air_sumur Well water safety status
 * @property {string} dampak_warga Household impact description
 * @property {string} rekomendasi Recommended intervention
 */

/**
 * @typedef {Object} UrbanRiskFeatureProperties
 * @property {string} nama_kelurahan Kelurahan name
 * @property {number} ranking_kerentanan Vulnerability rank (#1 to #10)
 * @property {number} elevasi_rata_m Average elevation in meters above sea level
 * @property {number} luas_wilayah_ha Administrative area in hectares
 * @property {number} jumlah_penduduk_jiwa Total population
 * @property {number} kk_terdampak_estimasi Estimated exposed households
 * @property {number} skor_ahp_risiko Multi-Criteria AHP Risk Score (0.00 - 1.00)
 * @property {string} klasifikasi_risiko Risk tier (TINGGI / SEDANG / RENDAH)
 * @property {string} tipe_ancaman Primary hazard threat
 * @property {string} rw_terdampak_list Exposed RW neighborhoods
 * @property {string} rekomendasi_mitigasi Policy recommendations
 */

/**
 * @typedef {Object} GuciWatershedFeatureProperties
 * @property {string} nama_desa Village name in upstream Guci
 * @property {number} elevasi_rata_m Average elevation (>700 mdpl)
 * @property {number} kemiringan_lereng_derajat Slope angle in degrees (>35°)
 * @property {number} tingkat_alih_fungsi_lahan_pct Deforestation percentage
 * @property {number} curah_hujan_ekstrem_mm_hari Extreme rainfall intensity (mm/day)
 * @property {string} keterangan_bencana Disaster history note
 * @property {string} prioritas_mitigasi Civil/ecological mitigation priority
 */

/**
 * @typedef {Object} PolderPumpProperties
 * @property {string} name Polder station name
 * @property {string} catchment_area Protected catchment area
 * @property {string} pump_units Machine units specification
 * @property {string} total_capacity_debit Total discharge capacity (L/s)
 * @property {string} retention_pond_volume Retention pond volume (m³)
 * @property {string} dyke_crest_level Dyke crest elevation (mdpl)
 * @property {string} backup_power Diesel genset specifications
 * @property {string} operational_agency Overseeing agency
 * @property {string} current_status Status description
 * @property {boolean} is_active True if running normally, false if failed/blackout
 */

export const SPATIAL_TYPES_VERSION = '1.0.0';
