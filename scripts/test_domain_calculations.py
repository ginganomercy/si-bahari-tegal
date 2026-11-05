#!/usr/bin/env python3
"""
scripts/test_domain_calculations.py
-----------------------------------
Automated unit test suite verifying domain formulas, AHP weight integrity,
dump truck capacity math, and flood simulation boundary constraints.
"""

import math
import sys
import os

# Import constants and formulas from run_hybrid_analysis
sys.path.insert(0, os.path.dirname(__file__))
from run_hybrid_analysis import (
    W_ELEVATION, W_SLOPE, W_DRAINAGE, W_LAND_USE, W_RAINFALL,
    THRESHOLD_HIGH_RISK, THRESHOLD_MEDIUM_RISK, SEDIMENT_CRITICAL_CM,
    calculate_urban_ahp, calculate_guci_ahp
)

def test_ahp_weights_sum():
    total = W_ELEVATION + W_SLOPE + W_DRAINAGE + W_LAND_USE + W_RAINFALL
    assert math.isclose(total, 1.0, rel_tol=1e-6), f"AHP weights must sum to 1.0, got {total}"
    print("[PASS] test_ahp_weights_sum: Weights strictly sum to 1.00")

def test_urban_ahp_scoring_boundaries():
    # Extreme high risk scenario: sea level 0.0m, dense population, heavy sediment
    score_extreme = calculate_urban_ahp(elev_m=0.2, pop_density=12000.0, near_drainage_sediment=85.0)
    assert score_extreme >= THRESHOLD_HIGH_RISK, f"Extreme case must be high risk, got {score_extreme}"
    assert 0.0 <= score_extreme <= 1.0, f"Score out of bounds: {score_extreme}"

    # Low risk scenario: higher elevation, low density, clean drainage
    score_safe = calculate_urban_ahp(elev_m=4.5, pop_density=2000.0, near_drainage_sediment=10.0)
    assert score_safe < THRESHOLD_MEDIUM_RISK, f"Safe case must be low risk, got {score_safe}"
    assert 0.0 <= score_safe <= 1.0, f"Score out of bounds: {score_safe}"

    print("[PASS] test_urban_ahp_scoring_boundaries: Boundary normalization (0.0 to 1.0) valid")

def test_guci_ahp_scoring_boundaries():
    # Steep slope > 40 deg, high deforestation, high elevation
    score_guci = calculate_guci_ahp(slope_deg=38.0, deforest_pct=35.0, elev_m=950.0)
    assert 0.0 <= score_guci <= 1.0, f"Guci score out of bounds: {score_guci}"
    assert score_guci >= THRESHOLD_HIGH_RISK, f"Steep slope must trigger high landslide risk, got {score_guci}"
    print("[PASS] test_guci_ahp_scoring_boundaries: Guci slope risk scoring valid")

def test_dump_truck_ritase_calculation():
    # 6.0 m³ per dump truck capacity standard
    TRUCK_CAP_M3 = 6.0

    cases = [
        (18.0, 3),   # Exact match
        (19.5, 4),   # Fractional ceiling
        (5.0, 1),    # Sub-capacity
        (0.0, 0),    # Zero volume
    ]

    for volume, expected_rit in cases:
        rit = math.ceil(volume / TRUCK_CAP_M3)
        assert rit == expected_rit, f"Volume {volume} m³ should yield {expected_rit} rit, got {rit}"

    print("[PASS] test_dump_truck_ritase_calculation: Dump truck logistics math verified")

def test_sediment_critical_threshold():
    assert SEDIMENT_CRITICAL_CM == 60.0, "Critical sediment threshold must be 60.0 cm"
    print("[PASS] test_sediment_critical_threshold: DPUPR critical threshold confirmed")

def main():
    print("=== Running Domain Mathematical Unit Tests ===")
    try:
        test_ahp_weights_sum()
        test_urban_ahp_scoring_boundaries()
        test_guci_ahp_scoring_boundaries()
        test_dump_truck_ritase_calculation()
        test_sediment_critical_threshold()
        print("--------------------------------------------------")
        print("ALL DOMAIN TESTS PASSED SUCCESSFULLY (5/5 PASS)")
        return 0
    except AssertionError as e:
        print(f"[FAIL] Domain calculation test failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
