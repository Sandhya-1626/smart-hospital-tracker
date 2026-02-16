import fs from 'fs';
import path from 'path';

// MOCK CONSTANTS / HELPERS
function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1));
}

// LOAD DATA
const hospitalsData = JSON.parse(fs.readFileSync('./src/services/hospitalsData.json', 'utf8'));
const cmchisHospitalsData = JSON.parse(fs.readFileSync('./src/services/cmchisHospitals.json', 'utf8'));

// DECORATE HELPER (Mocked from dataService.js)
const getHospitalType = (h) => {
    const nameLower = h.name.toLowerCase();
    if (nameLower.includes('govt') || nameLower.includes('government') || nameLower.includes('uphc') || nameLower.includes('gh') || nameLower.includes('primary health center')) {
        return 'Government';
    }
    if (h.specialists.length > 2 || nameLower.includes('multispeciality') || nameLower.includes('general hospital')) {
        return 'Multispeciality';
    }
    return 'Specialty';
};

const getEmergencyAvailability = (h) => {
    const type = getHospitalType(h);
    if (type === 'Government' || type === 'Multispeciality') return 'Available 24/7';
    return 'On Call / Limited';
};

const getDecoratedHospitals = () => {
    return hospitalsData.map(h => ({
        ...h,
        type: getHospitalType(h),
        emergency: getEmergencyAvailability(h)
    }));
};


// LOGIC TO TEST (Copied from dataService.js)
const recommendHospitals = async (specialty, userLocation = null, isEmergency = false, insuranceProvider = null, radius = 50) => {
    let allHospitals = [];
    let datasetSource = 'General';

    // 1. DATASET SELECTION & INSURANCE MAPPING (Strict Linking)
    if (insuranceProvider === "CMCHIS") {
        // STRICTLY CMCHIS DATASET
        allHospitals = cmchisHospitalsData.map(h => ({
            ...h,
            type: 'Government Empanelled',
            source: 'CMCHIS',
            fee: 0,
            insurance: ["CMCHIS"]
        }));
        datasetSource = 'CMCHIS';
    } else if (insuranceProvider === "New Health Insurance Scheme") {
        // STRICTLY INSURANCE DATASET
        allHospitals = getDecoratedHospitals().map(h => ({
            ...h,
            source: 'NHIS'
        }));
        datasetSource = 'NHIS';
    } else {
        // MERGED / GENERAL SEARCH
        const main = getDecoratedHospitals().map(h => ({ ...h, source: 'NHIS' }));
        const cmchis = cmchisHospitalsData.map(h => ({ ...h, type: 'Government Empanelled', source: 'CMCHIS', fee: 0, insurance: ["CMCHIS"] }));
        allHospitals = [...main, ...cmchis];
        datasetSource = 'Combined';
    }

    // 2. STRICT INSURANCE FILTERING
    let pool = allHospitals;
    // (Insurance filtering based on provider string logic if inside main dataset)
    // For NHIS, we trust the dataset selection for now, or filter if needed.

    // 3. DISTANCE FILTERING & SORTING
    if (userLocation) {
        pool = pool.map(h => ({
            ...h,
            distance: calculateDistance(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng)
        })).filter(h => h.distance <= radius)
            .sort((a, b) => a.distance - b.distance);
    } else {
        pool = pool.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    // 4. SPECIALTY FILTERING
    let results = pool;
    if (specialty && specialty !== "General") {
        const lowerSpecialty = specialty.toLowerCase();
        const exact = pool.filter(h => h.specialists.some(s => s.toLowerCase().includes(lowerSpecialty)));
        const loose = pool.filter(h =>
            !exact.includes(h) && (
                h.name.toLowerCase().includes(lowerSpecialty) ||
                h.type.toLowerCase().includes(lowerSpecialty)
            )
        );
        results = [...exact, ...loose];
    }

    // 5. DEDUPLICATION
    const uniqueResults = [];
    const seen = new Set();
    for (const h of results) {
        const key = h.id + "-" + (h.name || "unknown");
        if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(h);
        }
    }
    results = uniqueResults;

    // 6. EMERGENCY
    if (isEmergency) {
        const emerg = results.filter(h => h.emergency === 'Available 24/7');
        const nonEmerg = results.filter(h => h.emergency !== 'Available 24/7');
        results = [...emerg, ...nonEmerg];
    }

    return {
        hospitals: results.slice(0, 50),
        stats: {
            totalInPool: allHospitals.length,
            insuranceMatchCount: pool.length,
            symptomMatchCount: results.length,
            insuranceUsed: insuranceProvider
        }
    };
};

// RUN TESTS
async function run() {
    console.log("Running Verification...");

    // Test 1
    const res1 = await recommendHospitals("General", null, false, "CMCHIS");
    console.log(`CMCHIS Count: ${res1.hospitals.length}`);
    const check1 = res1.hospitals.every(h => h.source === 'CMCHIS');
    if (check1 && res1.hospitals.length > 0) console.log("✅ CMCHIS Source Check Passed");
    else console.error("❌ CMCHIS Source Check Failed");

    // Test 2
    const res2 = await recommendHospitals("General", null, false, "New Health Insurance Scheme");
    console.log(`NHIS Count: ${res2.hospitals.length}`);
    const check2 = res2.hospitals.every(h => h.source === 'NHIS');
    if (check2 && res2.hospitals.length > 0) console.log("✅ NHIS Source Check Passed");
    else console.error("❌ NHIS Source Check Failed");

    // Test 3 (Location)
    const res3 = await recommendHospitals("General", { lat: 13.08, lng: 80.27 }, false, "CMCHIS", 20);
    console.log(`Radius Filter Count: ${res3.hospitals.length}`);
    const check3 = res3.hospitals.every(h => h.distance <= 20);
    if (check3) console.log("✅ Radius Check Passed");
    else console.error("❌ Radius Check Failed");
}

run();
