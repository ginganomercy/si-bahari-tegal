#!/usr/bin/env python3
"""
scripts/verify_integrity.py
---------------------------
Automated test suite verifying data integrity, coordinates validity,
frontend modular asset structure, and domain calculations for SI-BAHARI 3D.
"""

import os
import json
import sys
import subprocess

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
    "_headers",
    "css/style.css",
    "js/config/map.constants.js",
    "js/types/spatial.types.js",
    "js/services/storage.service.js",
    "js/services/spatial-data.service.js",
    "js/components/landing/landing.template.js",
    "js/components/landing/landing.component.js",
    "js/components/tutorial/tutorial.steps.js",
    "js/components/tutorial/tutorial.template.js",
    "js/components/tutorial/tutorial.component.js",
    "js/components/inspector/inspector.template.js",
    "js/components/inspector/inspector.component.js",
    "js/components/drainage/drainage-list.component.js",
    "js/components/analytics/kelurahan-table.component.js",
    "js/components/ui/toast.component.js",
    "js/layers/terrain.layer.js",
    "js/layers/buildings.layer.js",
    "js/layers/hazard.layer.js",
    "js/layers/water.shader.js",
    "js/controllers/camera.controller.js",
    "js/controllers/simulation.controller.js",
    "js/main.js"
]

def verify_data_integrity():
    print("=== [1/3] Verifying Processed Spatial Data Integrity ===")
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
                print(f"[FAIL] {filename} is not a FeatureCollection")
                all_passed = False
                continue
                
            features = data.get("features", [])
            if not features:
                print(f"[FAIL] {filename} has 0 features")
                all_passed = False
                continue
                
            # Verify coordinates validity
            valid_coords = True
            for feat in features:
                geom = feat.get("geometry", {})
                if not geom or not geom.get("coordinates"):
                    valid_coords = False
                    break
            
            if not valid_coords:
                print(f"[FAIL] {filename} contains invalid coordinates")
                all_passed = False
                continue
                
            print(f"[PASS] {filename} -> {len(features)} valid features verified.")
        except Exception as e:
            print(f"[FAIL] Exception parsing {filename}: {e}")
            all_passed = False
            
    return all_passed

def verify_src_architecture():
    print("\n=== [2/3] Verifying Frontend Source Code Architecture ===")
    all_passed = True
    
    for rel_path in EXPECTED_SRC_FILES:
        filepath = os.path.join(SRC_DIR, rel_path)
        if not os.path.exists(filepath):
            print(f"[FAIL] Missing architecture file: src/{rel_path}")
            all_passed = False
        else:
            size = os.path.getsize(filepath)
            if size == 0:
                print(f"[FAIL] Empty file: src/{rel_path}")
                all_passed = False
            else:
                print(f"[PASS] {rel_path} ({size} bytes)")
                
    return all_passed

def verify_domain_calculations():
    print("\n=== [3/3] Running Domain Unit Tests (test_domain_calculations.py) ===")
    test_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_domain_calculations.py")
    result = subprocess.run([sys.executable, test_script], capture_output=False)
    return result.returncode == 0

def main():
    data_ok = verify_data_integrity()
    src_ok = verify_src_architecture()
    domain_ok = verify_domain_calculations()
    
    print("\n--------------------------------------------------")
    if data_ok and src_ok and domain_ok:
        print("RESULT: ALL INTEGRITY & DOMAIN TESTS PASSED (100% OK)")
        print("SI-BAHARI 3D Clean Architecture is production-ready for deployment.")
        return 0
    else:
        print("RESULT: VERIFICATION FAILED! Please inspect errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
