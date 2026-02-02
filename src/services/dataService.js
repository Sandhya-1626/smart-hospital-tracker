// Helper to calculate distance between two coordinates in km
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

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

import hospitalsData from './hospitalsData.json';

// Use the imported data instead of the hardcoded mock array
const hospitals = hospitalsData;

// Default search center (Center of Tamil Nadu roughly) if no location provided
const DEFAULT_LAT = 11.1271;
const DEFAULT_LNG = 78.6569;

export const getHospitals = async (userLocation = null) => {
    return new Promise((resolve) => {
        let sortedHospitals = [...hospitals];

        if (userLocation) {
            sortedHospitals = sortedHospitals.map(h => ({
                ...h,
                distance: calculateDistance(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng)
            })).sort((a, b) => a.distance - b.distance);
        } else {
            // Randomize slightly to not always show the same top 20
            sortedHospitals = sortedHospitals.sort(() => Math.random() - 0.5);
        }

        // Return top 20 relevant results
        setTimeout(() => resolve(sortedHospitals.slice(0, 20)), 800);
    });
};

export const searchHospitalsByIssue = async (issue, userLocation = null) => {
    const lowerIssue = issue.toLowerCase();

    // Comprehensive Symptom to Specialist Mapping
    const symptomRegistry = {
        cardiologist: ["heart", "chest pain", "palpitation", "breathless", "cardiac", "blood pressure", "bp"],
        "orthopedic surgeon": ["bone", "fracture", "joint pain", "knee", "spine", "back pain", "ortho", "accident"],
        ophthalmologist: ["eye", "vision", "cataract", "blur", "optics", "spectacles"],
        nephrologist: ["kidney", "dialysis", "urine", "renal"],
        oncologist: ["cancer", "tumor", "chemo", "radiation", "onco"],
        gynecologist: ["pregnant", "delivery", "women", "periods", "maternity", "baby"],
        radiologist: ["scan", "x-ray", "mri", "ct scan", "ultrasound", "imaging"],
        neurologist: ["headache", "brain", "stroke", "paralysis", "nerves", "migraine"],
        dentist: ["tooth", "teeth", "gum", "cavity", "dental", "extraction"],
        dermatologist: ["skin", "rash", "itching", "acne", "hair fall"],
        pediatrician: ["child", "infant", "newborn", "peds"],
        ent: ["ear", "nose", "throat", "sinus", "tonsils"]
    };

    let results = hospitals.filter(h => {
        // 1. Direct Name/Specialist Match
        if (h.name.toLowerCase().includes(lowerIssue)) return true;
        if (h.specialists.some(s => s.toLowerCase().includes(lowerIssue))) return true;

        // 2. Map Symptoms to Specialists
        for (const [specialist, symptoms] of Object.entries(symptomRegistry)) {
            if (symptoms.some(symptom => lowerIssue.includes(symptom))) {
                if (h.specialists.some(s => s.toLowerCase().includes(specialist))) {
                    return true;
                }
            }
        }

        return false;
    });

    if (userLocation) {
        results = results.map(h => ({
            ...h,
            distance: calculateDistance(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng)
        })).sort((a, b) => a.distance - b.distance);
    }

    return results;
};
