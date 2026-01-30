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

    let results = hospitals.filter(h => {
        // 1. Check if hospital name matches
        if (h.name.toLowerCase().includes(lowerIssue)) return true;

        // 2. Check if specialist matches
        const specialistMatch = h.specialists.some(s => s.toLowerCase().includes(lowerIssue));
        if (specialistMatch) return true;

        // 3. Symptom to Specialist Mapping
        if ((lowerIssue.includes("heart") || lowerIssue.includes("chest")) && h.specialists.includes("Cardiologist")) return true;
        if ((lowerIssue.includes("bone") || lowerIssue.includes("fracture") || lowerIssue.includes("pain")) && h.specialists.includes("Orthopedic Surgeon")) return true;
        if ((lowerIssue.includes("eye") || lowerIssue.includes("vision")) && h.specialists.includes("Ophthalmologist")) return true;
        if ((lowerIssue.includes("kidney") || lowerIssue.includes("dialysis")) && h.specialists.includes("Nephrologist")) return true;
        if (lowerIssue.includes("cancer") && h.specialists.includes("Oncologist")) return true;
        if ((lowerIssue.includes("pregnant") || lowerIssue.includes("delivery")) && h.specialists.includes("Gynecologist")) return true;
        if ((lowerIssue.includes("scan") || lowerIssue.includes("x-ray")) && h.specialists.includes("Radiologist")) return true;

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
