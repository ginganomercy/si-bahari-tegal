#!/usr/bin/env python3
"""
scripts/generate_spatial_seed.py
--------------------------------
Generates high-precision geospatial, civil engineering, and causal multi-hazard data
for Tegal & Guci (Banjir, Rob, Land Subsidence, Saline Intrusion, Drainage & Solid Waste).
"""

import os
import json
import math
import random
from typing import Dict, Any, List

RANDOM_SEED: int = 42
random.seed(RANDOM_SEED)

OUTPUT_DIR_RAW = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
os.makedirs(OUTPUT_DIR_RAW, exist_ok=True)

# --------------------------------------------------------------------------
# 1. KELURAHAN PESISIR & DATARAN RENDAH KOTA TEGAL
# --------------------------------------------------------------------------
URBAN_KELURAHAN_SEEDS = [
    {
        "name": "Tegalsari",
        "center": [109.1350, -6.8530],
        "elevation_m": 0.8,
        "area_ha": 185.4,
        "population": 18240,
        "population_density": 9840,
        "affected_rw": "RW 01, RW 02, RW 03, RW 04, RW 07",
        "affected_kk": 1420,
        "rank": 1,
        "flood_type": "Rob Pasang Air Laut Pesisir & Luapan Muara",
        "drainage_failure_score": 92.5,
        "radius_deg": 0.0075
    },
    {
        "name": "Pesurungan Lor",
        "center": [109.1120, -6.8620],
        "elevation_m": 1.2,
        "area_ha": 142.0,
        "population": 11450,
        "population_density": 8060,
        "affected_rw": "RW 01, RW 03, RW 05",
        "affected_kk": 980,
        "rank": 2,
        "flood_type": "Genangan Saluran Primer Mataram & Rob",
        "drainage_failure_score": 88.0,
        "radius_deg": 0.0068
    },
    {
        "name": "Pesurungan Kidul",
        "center": [109.1110, -6.8720],
        "elevation_m": 1.5,
        "area_ha": 128.5,
        "population": 10320,
        "population_density": 8030,
        "affected_rw": "RW 02, RW 04",
        "affected_kk": 760,
        "rank": 4,
        "flood_type": "Sedimentasi Gorong-gorong Silang Rel Kereta",
        "drainage_failure_score": 79.5,
        "radius_deg": 0.0062
    },
    {
        "name": "Sumurpanggang",
        "center": [109.1030, -6.8770],
        "elevation_m": 1.8,
        "area_ha": 164.2,
        "population": 14610,
        "population_density": 8890,
        "affected_rw": "RW 01, RW 02, RW 06",
        "affected_kk": 890,
        "rank": 5,
        "flood_type": "Limpasan Kali Kemiri & Drainase Tersumbat",
        "drainage_failure_score": 75.0,
        "radius_deg": 0.0072
    },
    {
        "name": "Krandon",
        "center": [109.0980, -6.8650],
        "elevation_m": 1.4,
        "area_ha": 155.0,
        "population": 10385,
        "population_density": 6700,
        "affected_rw": "RW 01, RW 03",
        "affected_kk": 620,
        "rank": 6,
        "flood_type": "Genangan Sawah & Permukiman Dataran Rendah",
        "drainage_failure_score": 68.0,
        "radius_deg": 0.0065
    },
    {
        "name": "Kaligangsa",
        "center": [109.0880, -6.8680],
        "elevation_m": 1.1,
        "area_ha": 210.8,
        "population": 13070,
        "population_density": 6200,
        "affected_rw": "RW 01, RW 02, RW 04, RW 05",
        "affected_kk": 1150,
        "rank": 3,
        "flood_type": "Muara Sungai Kaligangsa & Pasang Laut Harian",
        "drainage_failure_score": 85.0,
        "radius_deg": 0.0082
    },
    {
        "name": "Debong Kidul",
        "center": [109.1240, -6.8920],
        "elevation_m": 2.2,
        "area_ha": 115.3,
        "population": 10610,
        "population_density": 9200,
        "affected_rw": "RW 02, RW 03, RW 04",
        "affected_kk": 780,
        "rank": 7,
        "flood_type": "Sedimentasi Parah Saluran Sekunder Cik Ditiro",
        "drainage_failure_score": 82.0,
        "radius_deg": 0.0062
    },
    {
        "name": "Tunon",
        "center": [109.1180, -6.8860],
        "elevation_m": 2.0,
        "area_ha": 122.0,
        "population": 10250,
        "population_density": 8400,
        "affected_rw": "RW 01, RW 02",
        "affected_kk": 640,
        "rank": 8,
        "flood_type": "Penyempitan Saluran Tersier & Kurang Kemiringan",
        "drainage_failure_score": 77.0,
        "radius_deg": 0.0065
    },
    {
        "name": "Kalinyamat Kulon",
        "center": [109.1130, -6.8950],
        "elevation_m": 2.4,
        "area_ha": 130.5,
        "population": 10180,
        "population_density": 7800,
        "affected_rw": "RW 03, RW 04",
        "affected_kk": 520,
        "rank": 9,
        "flood_type": "Antrean Aliran Drainase Lambat & Air Kiriman",
        "drainage_failure_score": 64.0,
        "radius_deg": 0.0062
    },
    {
        "name": "Kalinyamat Wetan",
        "center": [109.1210, -6.8980],
        "elevation_m": 2.6,
        "area_ha": 138.0,
        "population": 11316,
        "population_density": 8200,
        "affected_rw": "RW 02, RW 05",
        "affected_kk": 480,
        "rank": 10,
        "flood_type": "Air Kiriman Saluran Penghubung Saluran Sekunder",
        "drainage_failure_score": 59.0,
        "radius_deg": 0.0065
    }
]

def generate_polygon(center: List[float], radius: float, points: int = 8) -> List[List[float]]:
    coords = []
    for i in range(points):
        angle = (2 * math.pi / points) * i
        r_jitter = radius * (0.88 + 0.25 * random.random())
        lon = center[0] + r_jitter * math.cos(angle) * 1.15
        lat = center[1] + r_jitter * math.sin(angle)
        coords.append([round(lon, 6), round(lat, 6)])
    coords.append(coords[0])
    return coords

def build_urban_zones() -> Dict[str, Any]:
    features = []
    for idx, kel in enumerate(URBAN_KELURAHAN_SEEDS):
        poly = generate_polygon(kel["center"], kel["radius_deg"])
        feat = {
            "type": "Feature",
            "properties": {
                "id": f"KEL-TG-{idx+1:03d}",
                "nama_kelurahan": kel["name"],
                "ranking_kerentanan": kel["rank"],
                "elevasi_rata_m": kel["elevation_m"],
                "luas_wilayah_ha": kel["area_ha"],
                "jumlah_penduduk_jiwa": kel["population"],
                "kepadatan_penduduk_jiwa_km2": kel["population_density"],
                "kk_terdampak_estimasi": kel["affected_kk"],
                "rw_terdampak_list": kel["affected_rw"],
                "skor_kerusakan_drainase": kel["drainage_failure_score"],
                "tipe_ancaman": kel["flood_type"],
                "zona": "Pesisir / Hilir Kota Tegal"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [poly]
            }
        }
        features.append(feat)
    return {"type": "FeatureCollection", "features": features}

# --------------------------------------------------------------------------
# 2. FAKTOR KAUSAL 1: PENURUNAN MUKA TANAH (LAND SUBSIDENCE)
# --------------------------------------------------------------------------
SUBSIDENCE_SEEDS = [
    {
        "id": "SUB-TG-01",
        "zona": "Pesisir Muarareja & Pelabuhan Tegalsari",
        "rate_cm_yr": 5.2,
        "formation": "Aluvium Pantai Muda Lunak",
        "cause": "Beban fisik pelabuhan & ekstraksi air tanah industri perikanan",
        "10yr_drop_cm": 52.0,
        "risk": "KRITIS TINGGI",
        "polygon": [
            [109.110, -6.832], [109.148, -6.838], [109.148, -6.858],
            [109.110, -6.855], [109.110, -6.832]
        ]
    },
    {
        "id": "SUB-TG-02",
        "zona": "Dataran Rendah Kaligangsa & Pesurungan",
        "rate_cm_yr": 3.4,
        "formation": "Sedimen Lanau Lempungan Dataran Banjir",
        "cause": "Konsolidasi tanah aluvial & drainase tambak intensif",
        "10yr_drop_cm": 34.0,
        "risk": "SEDANG WASPADA",
        "polygon": [
            [109.075, -6.850], [109.112, -6.852], [109.115, -6.875],
            [109.075, -6.875], [109.075, -6.850]
        ]
    },
    {
        "id": "SUB-TG-03",
        "zona": "Koridor Pesisir Timur Panggung",
        "rate_cm_yr": 4.1,
        "formation": "Gisik Pantai & Rawa Pasut",
        "cause": "Konversi tambak ke permukiman padat",
        "10yr_drop_cm": 41.0,
        "risk": "TINGGI",
        "polygon": [
            [109.145, -6.840], [109.175, -6.842], [109.175, -6.865],
            [109.145, -6.862], [109.145, -6.840]
        ]
    }
]

def build_subsidence_zones() -> Dict[str, Any]:
    features = []
    for sub in SUBSIDENCE_SEEDS:
        feat = {
            "type": "Feature",
            "properties": {
                "id": sub["id"],
                "nama_zona": sub["zona"],
                "laju_penurunan_cm_tahun": sub["rate_cm_yr"],
                "formasi_geologi": sub["formation"],
                "faktor_penyebab": sub["cause"],
                "akumulasi_penurunan_10th_cm": sub["10yr_drop_cm"],
                "tingkat_urgensi": sub["risk"],
                "rekomendasi_mitigasi": "Moratorium sumur dalam & peninggian tanggul polder"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [sub["polygon"]]
            }
        }
        features.append(feat)
    return {"type": "FeatureCollection", "features": features}

# --------------------------------------------------------------------------
# 3. FAKTOR KAUSAL 2: INTRUSI AIR ASIN (SALINE GROUNDWATER INTRUSION)
# --------------------------------------------------------------------------
def build_saline_intrusion_zone() -> Dict[str, Any]:
    # 1.5 km buffer along the coast of Tegal
    saline_poly = [
        [109.060, -6.825],
        [109.175, -6.835],
        [109.175, -6.865],
        [109.140, -6.868],
        [109.105, -6.862],
        [109.060, -6.855],
        [109.060, -6.825]
    ]
    feat = {
        "type": "Feature",
        "properties": {
            "id": "SAL-TG-01",
            "nama_zona": "Sabuk Intrusi Air Laut Pesisir Tegal (Buffer 1.5 km)",
            "salinitas_air_tanah_ppt": 3.8,
            "daya_hantar_listrik_us_cm": 4200,
            "status_air_sumur": "Payau / Tidak Layak Minum Langsung",
            "dampak_warga": "Ketergantungan tinggi pada suplai air tangki PDAM & korosi pipa logam",
            "rekomendasi": "Penyediaan instalasi desalinasi bertenaga surya & perluasan pipa PDAM"
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [saline_poly]
        }
    }
    return {"type": "FeatureCollection", "features": [feat]}

# --------------------------------------------------------------------------
# 4. FAKTOR KAUSAL 3: TITIK TUMPUKAN SAMPAH SALURAN (WASTE CHOKE POINTS)
# --------------------------------------------------------------------------
WASTE_CHOKES = [
    {
        "id": "WST-TG-01",
        "lokasi": "Bantaran Muara Kali Ketiwon",
        "coords": [109.1420, -6.8480],
        "volume_m3": 85.0,
        "waste_type": "Plastik kresek, stereofoam & batang bambu",
        "risk": "KRITIS (Menyumbat Pintu Air Muara)"
    },
    {
        "id": "WST-TG-02",
        "lokasi": "Jembatan Kali Kemiri Pasar Pagi",
        "coords": [109.1280, -6.8680],
        "volume_m3": 65.0,
        "waste_type": "Limbah pasar tradisional & sampah rumah tangga",
        "risk": "TINGGI (Bottle-neck Kolom Jembatan)"
    },
    {
        "id": "WST-TG-03",
        "lokasi": "Pertemuan Saluran Sekunder Kali Gung",
        "coords": [109.1310, -6.8820],
        "volume_m3": 50.0,
        "waste_type": "Endapan sampah kebun & kasur/perabot bekas",
        "risk": "SEDANG (Menghambat Aliran Masuk Polder)"
    }
]

def build_waste_chokes() -> Dict[str, Any]:
    features = []
    for wc in WASTE_CHOKES:
        feat = {
            "type": "Feature",
            "properties": {
                "id": wc["id"],
                "lokasi": wc["lokasi"],
                "estimasi_volume_m3": wc["volume_m3"],
                "karakteristik_sampah": wc["waste_type"],
                "dampak_hidrologi": wc["risk"],
                "rekomendasi_aksi": "Pemasangan Trash Boom terapung & jadwal pengangkatan berkala Dinas LH"
            },
            "geometry": {
                "type": "Point",
                "coordinates": wc["coords"]
            }
        }
        features.append(feat)
    return {"type": "FeatureCollection", "features": features}

# --------------------------------------------------------------------------
# 5. KAWASAN HULU GUCI & LERENG GUNUNG SLAMET
# --------------------------------------------------------------------------
GUCI_ZONES_SEEDS = [
    {
        "name": "Desa Guci (Pusat Wisata & Pemandian)",
        "center": [109.1670, -7.1920],
        "elevation_m": 1050.0,
        "slope_deg": 38.5,
        "area_ha": 340.5,
        "deforestation_rate_pct": 34.0,
        "rainfall_extreme_mm_day": 185.0,
        "hazard_note": "Titik Banjir Bandang & Longsor Des 2025 akibat curah hujan 185 mm/hari & alih fungsi lereng hutan",
        "mitigation_priority": "Sabo Dam 3 Unit + Reboisasi Tanaman Berakar Dalam (Vetiver/Aren)",
        "radius_deg": 0.012
    },
    {
        "name": "Desa Rembul",
        "center": [109.1550, -7.1850],
        "elevation_m": 920.0,
        "slope_deg": 28.0,
        "area_ha": 285.0,
        "deforestation_rate_pct": 28.0,
        "rainfall_extreme_mm_day": 165.0,
        "hazard_note": "Zona limpasan air hujan menuju alur Sungai Gung dengan potensi debris flow tinggi",
        "mitigation_priority": "Pembuatan Terasering Berundak & Saluran Pengelak Lahar Dingin",
        "radius_deg": 0.011
    },
    {
        "name": "Desa Tuwel",
        "center": [109.1480, -7.1700],
        "elevation_m": 780.0,
        "slope_deg": 22.0,
        "area_ha": 310.2,
        "deforestation_rate_pct": 22.0,
        "rainfall_extreme_mm_day": 150.0,
        "hazard_note": "Jalur transmisi debit puncak dari lereng atas menuju bantaran Sungai Gung Kabupaten",
        "mitigation_priority": "Penguatan Tebing Sungai (Bronjong Kawat) & Early Warning System Banjir",
        "radius_deg": 0.013
    }
]

def build_guci_zones() -> Dict[str, Any]:
    features = []
    for idx, gz in enumerate(GUCI_ZONES_SEEDS):
        poly = generate_polygon(gz["center"], gz["radius_deg"], points=10)
        feat = {
            "type": "Feature",
            "properties": {
                "id": f"HULU-GC-{idx+1:03d}",
                "nama_desa": gz["name"],
                "elevasi_rata_m": gz["elevation_m"],
                "kemiringan_lereng_derajat": gz["slope_deg"],
                "luas_wilayah_ha": gz["area_ha"],
                "tingkat_alih_fungsi_lahan_pct": gz["deforestation_rate_pct"],
                "curah_hujan_ekstrem_mm_hari": gz["rainfall_extreme_mm_day"],
                "keterangan_bencana": gz["hazard_note"],
                "prioritas_mitigasi": gz["mitigation_priority"],
                "zona": "Kawasan Hulu Lereng Gunung Slamet"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [poly]
            }
        }
        features.append(feat)
    return {"type": "FeatureCollection", "features": features}

# --------------------------------------------------------------------------
# 6. TITIK KRITIS DRAINASE DENGAN PARAMETER HIDROLOGI
# --------------------------------------------------------------------------
DRAINAGE_POINTS = [
    {
        "id": "DRN-TG-001",
        "kelurahan": "Debong Kidul",
        "lokasi": "Saluran Sekunder Jl. Teuku Cik Ditiro (STA 0+450)",
        "coords": [109.1235, -6.8912],
        "channel_type": "Saluran Sekunder Pasangan Batu Kali",
        "sediment_cm": 65.0,
        "channel_width_m": 2.5,
        "channel_depth_m": 1.8,
        "length_m": 600.0,
        "q_design_m3s": 4.2,
        "q_existing_m3s": 1.15,
        "affected_kk": 420,
        "loss_mio_rp": 850.0,
        "cause": "Sedimentasi lumpur lempung padat & sampah plastik domestik",
        "flood_history_depth_cm": 45.0,
        "sop": "Excavator PC-50 Long-Arm + 4 Dump Truck 6m³",
        "duration_days": 14,
        "agency": "Dinas PUPR Kota Tegal Bidang SDA"
    },
    {
        "id": "DRN-TG-002",
        "kelurahan": "Tunon",
        "lokasi": "Saluran Tersier Pemukiman RW 02 (STA 0+180)",
        "coords": [109.1189, -6.8856],
        "channel_type": "Saluran Tersier U-Ditch Tertutup",
        "sediment_cm": 75.0,
        "channel_width_m": 1.6,
        "channel_depth_m": 1.2,
        "length_m": 450.0,
        "q_design_m3s": 2.1,
        "q_existing_m3s": 0.35,
        "affected_kk": 310,
        "loss_mio_rp": 420.0,
        "cause": "Penyempitan lebar saluran dan endapan tanah kebun warga",
        "flood_history_depth_cm": 50.0,
        "sop": "Manual Pengerukan Tenaga Kerja (PUPR) + Mini Tipper",
        "duration_days": 10,
        "agency": "Dinas PUPR Kota Tegal & Kelurahan Tunon"
    },
    {
        "id": "DRN-TG-003",
        "kelurahan": "Tegalsari",
        "lokasi": "Muara Drainase Pesisir Pelabuhan Perikanan (STA 0+050)",
        "coords": [109.1362, -6.8521],
        "channel_type": "Saluran Primer Terbuka Muara Laut",
        "sediment_cm": 80.0,
        "channel_width_m": 4.5,
        "channel_depth_m": 2.5,
        "length_m": 850.0,
        "q_design_m3s": 12.5,
        "q_existing_m3s": 2.2,
        "affected_kk": 1150,
        "loss_mio_rp": 2400.0,
        "cause": "Sedimentasi pasir laut (littoral drift) + pasang rob harian",
        "flood_history_depth_cm": 65.0,
        "sop": "Amphibious Dredger BBWS Pemali-Juana + Ponton Keruk",
        "duration_days": 30,
        "agency": "BBWS Pemali-Juana & Dinas PUPR Kota Tegal"
    },
    {
        "id": "DRN-TG-004",
        "kelurahan": "Sumurpanggang",
        "lokasi": "Saluran Pembuang Kali Kemiri (STA 1+100)",
        "coords": [109.1025, -6.8789],
        "channel_type": "Saluran Sekunder Tanah Terbuka",
        "sediment_cm": 55.0,
        "channel_width_m": 3.0,
        "channel_depth_m": 1.8,
        "length_m": 500.0,
        "q_design_m3s": 5.4,
        "q_existing_m3s": 2.1,
        "affected_kk": 480,
        "loss_mio_rp": 670.0,
        "cause": "Sedimentasi lumpur kiriman banjir hulu Kabupaten",
        "flood_history_depth_cm": 45.0,
        "sop": "Excavator Standard PC-200 + 3 Dump Truck 8m³",
        "duration_days": 12,
        "agency": "Dinas PUPR Kota Tegal"
    },
    {
        "id": "DRN-TG-005",
        "kelurahan": "Pesurungan Lor",
        "lokasi": "Saluran Induk Jl. Mataram (STA 0+750)",
        "coords": [109.1128, -6.8615],
        "channel_type": "Saluran Primer Pasangan Batu Kali",
        "sediment_cm": 70.0,
        "channel_width_m": 3.2,
        "channel_depth_m": 2.0,
        "length_m": 700.0,
        "q_design_m3s": 7.8,
        "q_existing_m3s": 2.15,
        "affected_kk": 620,
        "loss_mio_rp": 1250.0,
        "cause": "Penyumbatan sampah anorganik & endapan lempung industri",
        "flood_history_depth_cm": 55.0,
        "sop": "Excavator PC-75 + Truk Compactor Sampah DLH",
        "duration_days": 16,
        "agency": "Dinas PUPR & Dinas Lingkungan Hidup Kota Tegal"
    },
    {
        "id": "DRN-TG-006",
        "kelurahan": "Pesurungan Kidul",
        "lokasi": "Gorong-gorong Silang Rel Kereta Api (STA 0+320)",
        "coords": [109.1105, -6.8718],
        "channel_type": "Box Culvert Beton Ganda (2x 1.5m)",
        "sediment_cm": 68.0,
        "channel_width_m": 3.0,
        "channel_depth_m": 1.5,
        "length_m": 250.0,
        "q_design_m3s": 4.8,
        "q_existing_m3s": 1.45,
        "affected_kk": 390,
        "loss_mio_rp": 580.0,
        "cause": "Bottle-neck gorong-gorong rel KA tertutup endapan lumpur",
        "flood_history_depth_cm": 48.0,
        "sop": "Water Jet Flushing High-Pressure + Manual Sludge Sucker",
        "duration_days": 7,
        "agency": "Dinas PUPR Kota Tegal & PT KAI Daop 4"
    },
    {
        "id": "DRN-TG-007",
        "kelurahan": "Kalinyamat Kulon",
        "lokasi": "Saluran Drainase Perbatasan Sawah RW 03 (STA 0+400)",
        "coords": [109.1138, -6.8942],
        "channel_type": "Saluran Tanah Alami",
        "sediment_cm": 50.0,
        "channel_width_m": 2.0,
        "channel_depth_m": 1.4,
        "length_m": 400.0,
        "q_design_m3s": 2.8,
        "q_existing_m3s": 1.25,
        "affected_kk": 240,
        "loss_mio_rp": 310.0,
        "cause": "Longsoran tebing saluran tanah & gulma eceng gondok",
        "flood_history_depth_cm": 35.0,
        "sop": "Normalisasi Profil Saluran + Pemasangan Talud Bronjong",
        "duration_days": 15,
        "agency": "Dinas PUPR Kota Tegal"
    },
    {
        "id": "DRN-TG-008",
        "kelurahan": "Kaligangsa",
        "lokasi": "Saluran Pembuang Kali Ketiwon Barat (STA 0+150)",
        "coords": [109.0875, -6.8672],
        "channel_type": "Saluran Primer Muara Estuari",
        "sediment_cm": 78.0,
        "channel_width_m": 4.2,
        "channel_depth_m": 2.2,
        "length_m": 800.0,
        "q_design_m3s": 9.5,
        "q_existing_m3s": 1.85,
        "affected_kk": 870,
        "loss_mio_rp": 1750.0,
        "cause": "Sedimen lumpur tambak & pasang rob backwater",
        "flood_history_depth_cm": 58.0,
        "sop": "Excavator Long-Arm BBWS + Pembuatan Pintu Klep Otomatis",
        "duration_days": 21,
        "agency": "BBWS Pemali-Juana & Dinas PUPR Kota Tegal"
    },
    {
        "id": "DRN-TG-009",
        "kelurahan": "Krandon",
        "lokasi": "Saluran Pemukiman Jl. Abdul Syukur (STA 0+250)",
        "coords": [109.0975, -6.8645],
        "channel_type": "Saluran Sekunder Pasangan Batu",
        "sediment_cm": 48.0,
        "channel_width_m": 1.8,
        "channel_depth_m": 1.3,
        "length_m": 350.0,
        "q_design_m3s": 2.4,
        "q_existing_m3s": 1.2,
        "affected_kk": 290,
        "loss_mio_rp": 380.0,
        "cause": "Pertumbuhan eceng gondok & endapan lumpur domestik",
        "flood_history_depth_cm": 30.0,
        "sop": "Pembersihan Gulma Mekanis + Penggelontoran Pintu Air",
        "duration_days": 6,
        "agency": "Dinas Lingkungan Hidup & PUPR Kota Tegal"
    }
]

def build_drainage_points() -> Dict[str, Any]:
    features = []
    for dp in DRAINAGE_POINTS:
        sed_m = dp["sediment_cm"] / 100.0
        sed_vol_m3 = round(dp["channel_width_m"] * sed_m * dp["length_m"], 1)
        dump_rit = math.ceil(sed_vol_m3 / 6.0)
        loss_pct = round(((dp["q_design_m3s"] - dp["q_existing_m3s"]) / dp["q_design_m3s"]) * 100.0, 1)
        
        feat = {
            "type": "Feature",
            "properties": {
                "id": dp["id"],
                "kelurahan": dp["kelurahan"],
                "lokasi": dp["lokasi"],
                "tipe_saluran": dp["channel_type"],
                "sediment_depth_cm": dp["sediment_cm"],
                "lebar_saluran_m": dp["channel_width_m"],
                "kedalaman_saluran_m": dp["channel_depth_m"],
                "panjang_saluran_m": dp["length_m"],
                "volume_sedimen_m3": sed_vol_m3,
                "ritase_dump_truck": dump_rit,
                "debit_rencana_m3s": dp["q_design_m3s"],
                "debit_eksisting_m3s": dp["q_existing_m3s"],
                "capacity_loss_pct": loss_pct,
                "kk_terdampak": dp["affected_kk"],
                "estimasi_kerugian_juta_rp": dp["loss_mio_rp"],
                "clogging_source": dp["cause"],
                "flood_history_depth_cm": dp["flood_history_depth_cm"],
                "sop_alat_berat": dp["sop"],
                "durasi_pengerjaan_hari": dp["duration_days"],
                "instansi_penanggung_jawab": dp["agency"],
                "tingkat_kegawatan": "KRITIS (Prioritas 1)" if dp["sediment_cm"] >= 60.0 else "WASPADA (Prioritas 2)"
            },
            "geometry": {
                "type": "Point",
                "coordinates": dp["coords"]
            }
        }
        features.append(feat)
    return {"type": "FeatureCollection", "features": features}

# --------------------------------------------------------------------------
# 7. BUILDING FOOTPRINTS (3D EXTRUSIONS)
# --------------------------------------------------------------------------
def build_building_footprints() -> Dict[str, Any]:
    features = []
    building_id = 1
    
    for kel in URBAN_KELURAHAN_SEEDS:
        cx, cy = kel["center"]
        base_elev = kel["elevation_m"]
        
        count = random.randint(18, 24)
        for _ in range(count):
            bx = cx + (random.random() - 0.5) * 0.007
            by = cy + (random.random() - 0.5) * 0.006
            
            levels = random.choices([1, 2, 3, 4], weights=[0.65, 0.25, 0.08, 0.02])[0]
            height_m = round(levels * 3.5 + random.uniform(-0.3, 0.6), 1)
            
            w = 0.00015 * random.uniform(0.7, 1.4)
            h = 0.00014 * random.uniform(0.7, 1.4)
            
            box = [
                [round(bx - w, 6), round(by - h, 6)],
                [round(bx + w, 6), round(by - h, 6)],
                [round(bx + w, 6), round(by + h, 6)],
                [round(bx - w, 6), round(by + h, 6)],
                [round(bx - w, 6), round(by - h, 6)]
            ]
            
            feat = {
                "type": "Feature",
                "properties": {
                    "id": f"BLD-TG-{building_id:04d}",
                    "kelurahan": kel["name"],
                    "levels": levels,
                    "height_m": height_m,
                    "ground_elevation_m": base_elev,
                    "structural_risk": "Tinggi" if base_elev <= 1.2 else "Sedang"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [box]
                }
            }
            features.append(feat)
            building_id += 1
            
    return {"type": "FeatureCollection", "features": features}

def main():
    print("Generating comprehensive causal multi-hazard seeds for Tegal & Guci...")
    
    # 1. Urban Kelurahan
    urban_data = build_urban_zones()
    with open(os.path.join(OUTPUT_DIR_RAW, "tegal_urban_zones.geojson"), "w", encoding="utf-8") as f:
        json.dump(urban_data, f, indent=2)
    print(f" -> tegal_urban_zones.geojson ({len(urban_data['features'])} kelurahans)")

    # 2. Land Subsidence Causal Layer
    sub_data = build_subsidence_zones()
    with open(os.path.join(OUTPUT_DIR_RAW, "tegal_land_subsidence.geojson"), "w", encoding="utf-8") as f:
        json.dump(sub_data, f, indent=2)
    print(f" -> tegal_land_subsidence.geojson ({len(sub_data['features'])} subsidence zones)")

    # 3. Saline Water Intrusion Causal Layer
    saline_data = build_saline_intrusion_zone()
    with open(os.path.join(OUTPUT_DIR_RAW, "tegal_saline_intrusion.geojson"), "w", encoding="utf-8") as f:
        json.dump(saline_data, f, indent=2)
    print(f" -> tegal_saline_intrusion.geojson (1 saline intrusion buffer)")

    # 4. Drainage Solid Waste Chokes
    waste_data = build_waste_chokes()
    with open(os.path.join(OUTPUT_DIR_RAW, "drainage_waste_chokes.geojson"), "w", encoding="utf-8") as f:
        json.dump(waste_data, f, indent=2)
    print(f" -> drainage_waste_chokes.geojson ({len(waste_data['features'])} solid waste choke points)")

    # 5. Guci Watershed
    guci_data = build_guci_zones()
    with open(os.path.join(OUTPUT_DIR_RAW, "guci_watershed_zones.geojson"), "w", encoding="utf-8") as f:
        json.dump(guci_data, f, indent=2)
    print(f" -> guci_watershed_zones.geojson ({len(guci_data['features'])} hulu zones)")

    # 6. Drainage Bottlenecks
    drainage_data = build_drainage_points()
    with open(os.path.join(OUTPUT_DIR_RAW, "drainage_bottlenecks.geojson"), "w", encoding="utf-8") as f:
        json.dump(drainage_data, f, indent=2)
    print(f" -> drainage_bottlenecks.geojson ({len(drainage_data['features'])} points)")

    # 7. 3D Buildings
    bld_data = build_building_footprints()
    with open(os.path.join(OUTPUT_DIR_RAW, "buildings_footprints_tegal.geojson"), "w", encoding="utf-8") as f:
        json.dump(bld_data, f, indent=2)
    print(f" -> buildings_footprints_tegal.geojson ({len(bld_data['features'])} 3D buildings)")
    
    print("All causal multi-hazard spatial seeds generated successfully.")

if __name__ == "__main__":
    main()
