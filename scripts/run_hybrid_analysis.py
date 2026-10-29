#!/usr/bin/env python3
"""
scripts/run_hybrid_analysis.py
------------------------------
Hybrid Spatial Risk Engine:
Combines Multi-Criteria Evaluation (AHP) with Deterministic Thresholds.
Processes raw layers and causal multi-hazard layers, producing production GeoJSON files
in data/processed/ and src/data/processed/.
"""

import os
import json
import shutil
from typing import Dict, Any, List

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "processed")
SRC_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data", "processed")
os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(SRC_DATA_DIR, exist_ok=True)

# --------------------------------------------------------------------------
# AHP WEIGHT CONSTANTS (Must sum to 1.00)
# --------------------------------------------------------------------------
W_ELEVATION: float = 0.30
W_SLOPE: float = 0.25
W_DRAINAGE: float = 0.20
W_LAND_USE: float = 0.15
W_RAINFALL: float = 0.10

TOTAL_WEIGHT = W_ELEVATION + W_SLOPE + W_DRAINAGE + W_LAND_USE + W_RAINFALL
assert abs(TOTAL_WEIGHT - 1.0) < 1e-6, f"AHP weights must sum to 1.0, got {TOTAL_WEIGHT}"

THRESHOLD_HIGH_RISK: float = 0.70
THRESHOLD_MEDIUM_RISK: float = 0.40
SEDIMENT_CRITICAL_CM: float = 60.0

def calculate_urban_ahp(elev_m: float, pop_density: float, near_drainage_sediment: float) -> float:
    s_elev = max(0.0, min(1.0, 1.0 - (elev_m / 3.5)))
    s_slope = 0.85
    s_drain = max(0.0, min(1.0, (near_drainage_sediment - 40.0) / 45.0))
    s_land = max(0.0, min(1.0, pop_density / 12000.0))
    s_rain = 0.80
    score = (
        W_ELEVATION * s_elev +
        W_SLOPE * s_slope +
        W_DRAINAGE * s_drain +
        W_LAND_USE * s_land +
        W_RAINFALL * s_rain
    )
    return round(score, 4)

def calculate_guci_ahp(slope_deg: float, deforest_pct: float, elev_m: float) -> float:
    s_slope = max(0.0, min(1.0, slope_deg / 45.0))
    s_land = max(0.0, min(1.0, deforest_pct / 40.0))
    s_elev = max(0.0, min(1.0, (elev_m - 600.0) / 700.0))
    s_drain = 0.90
    s_rain = 0.95
    score = (
        W_ELEVATION * s_elev +
        W_SLOPE * s_slope +
        W_DRAINAGE * s_drain +
        W_LAND_USE * s_land +
        W_RAINFALL * s_rain
    )
    return round(score, 4)

def classify_risk(score: float) -> str:
    if score >= THRESHOLD_HIGH_RISK:
        return "TINGGI"
    elif score >= THRESHOLD_MEDIUM_RISK:
        return "SEDANG"
    return "RENDAH"

def process_urban_zones():
    raw_path = os.path.join(RAW_DIR, "tegal_urban_zones.geojson")
    with open(raw_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for feat in data["features"]:
        props = feat["properties"]
        elev = props["elevasi_rata_m"]
        density = props["kepadatan_penduduk_jiwa_km2"]
        sediment = 75.0 if elev <= 1.2 else (65.0 if elev <= 2.0 else 50.0)
        
        score = calculate_urban_ahp(elev, density, sediment)
        category = classify_risk(score)
        
        props["skor_ahp_risiko"] = score
        props["klasifikasi_risiko"] = category
        props["rekomendasi_mitigasi"] = (
            "Normalisasi drainase mendesak + Polder otomatis & pompa rob"
            if category == "TINGGI" else
            "Pembersihan sedimentasi rutin & sumur resapan"
        )
        
    out_path = os.path.join(PROCESSED_DIR, "tegal_hybrid_risk.geojson")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f" -> Processed {len(data['features'])} urban zones -> {out_path}")

def process_guci_zones():
    raw_path = os.path.join(RAW_DIR, "guci_watershed_zones.geojson")
    with open(raw_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for feat in data["features"]:
        props = feat["properties"]
        slope = props["kemiringan_lereng_derajat"]
        deforest = props["tingkat_alih_fungsi_lahan_pct"]
        elev = props["elevasi_rata_m"]
        
        score = calculate_guci_ahp(slope, deforest, elev)
        category = classify_risk(score)
        
        props["skor_ahp_risiko"] = score
        props["klasifikasi_risiko"] = category
        props["rekomendasi_mitigasi"] = (
            "Moratorium alih fungsi lereng + Reboisasi akar dalam (Vetiver/Aren)"
            if category == "TINGGI" else
            "Terasering berundak & Sabo Dam penahan limpasan"
        )
        
    out_path = os.path.join(PROCESSED_DIR, "guci_landslide_risk.geojson")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f" -> Processed {len(data['features'])} hulu zones -> {out_path}")

def process_drainage_points():
    raw_path = os.path.join(RAW_DIR, "drainage_bottlenecks.geojson")
    with open(raw_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    for feat in data["features"]:
        props = feat["properties"]
        sed = props["sediment_depth_cm"]
        props["tingkat_kegawatan"] = "KRITIS (Prioritas 1)" if sed >= SEDIMENT_CRITICAL_CM else "WASPADA (Prioritas 2)"
        props["anggaran_estimasi_pengerukan_juta_rp"] = round(sed * 1.75, 1)
        
    out_path = os.path.join(PROCESSED_DIR, "drainage_critical_points.geojson")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f" -> Processed {len(data['features'])} drainage points -> {out_path}")

def sync_causal_layers():
    # Sync buildings
    bld_raw = os.path.join(RAW_DIR, "buildings_footprints_tegal.geojson")
    bld_proc = os.path.join(PROCESSED_DIR, "buildings_footprints_tegal.geojson")
    shutil.copyfile(bld_raw, bld_proc)
    
    # Sync Land Subsidence
    sub_raw = os.path.join(RAW_DIR, "tegal_land_subsidence.geojson")
    sub_proc = os.path.join(PROCESSED_DIR, "tegal_land_subsidence.geojson")
    if os.path.exists(sub_raw):
        shutil.copyfile(sub_raw, sub_proc)
        print(f" -> Synced Land Subsidence layer to {sub_proc}")
        
    # Sync Saline Intrusion
    sal_raw = os.path.join(RAW_DIR, "tegal_saline_intrusion.geojson")
    sal_proc = os.path.join(PROCESSED_DIR, "tegal_saline_intrusion.geojson")
    if os.path.exists(sal_raw):
        shutil.copyfile(sal_raw, sal_proc)
        print(f" -> Synced Saline Intrusion layer to {sal_proc}")
        
    # Sync Waste Chokes
    wst_raw = os.path.join(RAW_DIR, "drainage_waste_chokes.geojson")
    wst_proc = os.path.join(PROCESSED_DIR, "drainage_waste_chokes.geojson")
    if os.path.exists(wst_raw):
        shutil.copyfile(wst_raw, wst_proc)
        print(f" -> Synced Waste Choke Points layer to {wst_proc}")

def main():
    print("Executing Hybrid AHP & Causal Multi-Hazard Spatial Engine...")
    process_urban_zones()
    process_guci_zones()
    process_drainage_points()
    sync_causal_layers()
    
    # Mirror all processed layers to src/data/processed
    for item in os.listdir(PROCESSED_DIR):
        src_file = os.path.join(PROCESSED_DIR, item)
        dst_file = os.path.join(SRC_DATA_DIR, item)
        if os.path.isfile(src_file):
            shutil.copyfile(src_file, dst_file)
    print(f" -> Mirrored all causal layers to {SRC_DATA_DIR}")
    
    print("Causal multi-hazard analysis complete. All layers web-ready.")

if __name__ == "__main__":
    main()
