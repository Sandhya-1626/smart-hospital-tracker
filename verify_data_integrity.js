import { recommendHospitals } from './src/services/dataService.js';

async function verify() {
    console.log("🚀 Starting Data Integrity Verification for Insurance Linking...");

    try {
        // Test 1: CMCHIS
        console.log("\n--- TEST 1: CMCHIS Input ---");
        const res1 = await recommendHospitals("General", null, false, "CMCHIS");
        console.log(`Stats matches: ${res1.stats.insuranceMatchCount}`);

        const isCmchisCorrect = res1.hospitals.every(h => h.source === 'CMCHIS');
        if (isCmchisCorrect && res1.hospitals.length > 0) {
            console.log("✅ PASS: All results match source 'CMCHIS'.");
        } else {
            console.error("❌ FAIL: Results contain non-CMCHIS sources or empty.", res1.hospitals[0]);
        }

        // Test 2: New Health Insurance Scheme
        console.log("\n--- TEST 2: New Health Insurance Scheme Input ---");
        const res2 = await recommendHospitals("General", null, false, "New Health Insurance Scheme");
        console.log(`Stats matches: ${res2.stats.insuranceMatchCount}`);

        const isNhisCorrect = res2.hospitals.every(h => h.source === 'NHIS');
        if (isNhisCorrect && res2.hospitals.length > 0) {
            console.log("✅ PASS: All results match source 'NHIS'.");
        } else {
            console.error("❌ FAIL: Results contain non-NHIS sources or empty.", res2.hospitals[0]);
        }

        // Test 3: Radius Filter (Mock Location)
        console.log("\n--- TEST 3: Radius Filter (10km) ---");
        const mockLoc = { lat: 13.0827, lng: 80.2707 }; // Chennai
        const res3 = await recommendHospitals("General", mockLoc, false, "CMCHIS", 10);
        console.log(`Found ${res3.hospitals.length} hospitals within 10km of Chennai.`);

        const distCheck = res3.hospitals.every(h => h.distance <= 10);
        if (distCheck) {
            console.log("✅ PASS: All results are within 10km.");
        } else {
            console.error("❌ FAIL: Found hospitals outside 10km radius.");
        }

    } catch (e) {
        console.error("❌ ERROR during verification:", e);
    }
}

// Node.js JSON import shim if needed or ensure environment supports it
// In "type": "module" package, this should generally work if files exist
verify();
