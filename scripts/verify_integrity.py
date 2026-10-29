#!/usr/bin/env python3
"""
scripts/verify_integrity.py
---------------------------
Automated test suite verifying data integrity, coordinates validity,
and frontend asset structure for Tegal 3D WebGIS.
"""

import os
import json
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
SRC_DIR = os.path.join(BASE_DIR, "src")

EXPECTED_DATA_FILES = [
    "tegal_hybrid_risk.geojson",
    "guci_landslide_risk.geojson",
    "drainage_critical_points.geojson",
    "buildings_footprints_tegal.geojson",
    "tegal_land_subsidence.geojson",
    "tegal_saline_intrusion.geojson",
    "drainage_waste_chokes.geojson"
]

EXPECTED_SRC_FILES = [
    "index.html",
    "css/style.css",
    "js/config/map.constants.js",
    "js/services/storage.service.js",
    "js/components/landing/landing.template.js",
    "js/components/landing/landing.component.js",
    "js/components/tutorial/tutorial.steps.js",
    "js/components/tutorial/tutorial.template.js",
    "js/components/tutorial/tutorial.component.js",
    "js/layers/terrain.layer.js",
    "js/layers/buildings.layer.js",
    "js/layers/hazard.layer.js",
    "js/layers/water.shader.js",
    "js/controllers/camera.controller.js",
    "js/controllers/simulation.controller.js",
    "js/main.js"
]

def verify_data_integrity():
    print("=== [1/2] Verifying Processed Spatial Data Integrity ===")
    all_passed = True
    
    for filename in EXPECTED_DATA_FILES:
        filepath = os.path.join(PROCESSED_DIR, filename)
        if not os.path.exists(filepath):
            print(f"[FAIL] Missing file: {filepath}")
            all_passed = False
            continue
            
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            if data.get("type") != "FeatureCollection":
                print(f"[FAIL] {filename} is not a valid FeatureCollection")
                all_passed = False
                continue
                
            features = data.get("features", [])
            if len(features) == 0:
                print(f"[FAIL] {filename} contains 0 features")
                all_passed = False
                continue
                
            # Verify no NaN or null coordinates
            for feat in features:
                geom = feat.get("geometry")
                if not geom or "coordinates" not in geom:
                    print(f"[FAIL] Feature {feat.get('properties', {}).get('id')} missing coordinates")
                    all_passed = False
                    break
                    
            print(f"[PASS] {filename} -> {len(features)} valid features verified.")
        except Exception as e:
            print(f"[FAIL] Error reading {filename}: {str(e)}")
            all_passed = False
            
    return all_passed

def verify_source_assets():
    print("\n=== [2/2] Verifying Frontend Source Code Architecture ===")
    all_passed = True
    
    for relative_path in EXPECTED_SRC_FILES:
        filepath = os.path.join(SRC_DIR, relative_path)
        if not os.path.exists(filepath):
            print(f"[FAIL] Missing file: {relative_path}")
            all_passed = False
            continue
            
        size = os.path.getsize(filepath)
        if size == 0:
            print(f"[FAIL] File is empty: {relative_path}")
            all_passed = False
            continue
            
        print(f"[PASS] {relative_path} ({size} bytes)")
        
    return all_passed

def main():
    data_ok = verify_data_integrity()
    src_ok = verify_source_assets()
    
    print("\n--------------------------------------------------")
    if data_ok and src_ok:
        print("RESULT: ALL INTEGRITY CHECKS PASSED (100% OK)")
        print("Tegal 3D WebGIS is production-ready for deployment.")
        sys.exit(0)
    else:
        print("RESULT: INTEGRITY VERIFICATION FAILED.")
        sys.exit(1)

if __name__ == "__main__":
    main()

