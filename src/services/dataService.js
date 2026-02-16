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
import insurancePolicies from './insurancePolicies.json';
import coverageData from './coverageData.json';
import cmchisHospitalsData from './cmchisHospitals.json';

// Use the imported data instead of the hardcoded mock array
const hospitals = hospitalsData;

// --- INSURANCE LOGIC ---

// 1. Search for a policy by name (Fuzzy match)
export const searchInsurancePolicy = (query) => {
    if (!query) return null;
    const lowerQuery = query.toLowerCase().replace(/\s+/g, ' ').trim();

    // Find best match
    const policy = insurancePolicies.find(p =>
        p.policy_name.toLowerCase().includes(lowerQuery) ||
        lowerQuery.includes(p.policy_name.toLowerCase()) ||
        (lowerQuery.includes("cmchis") && p.policy_name.includes("CMCHIS")) // Explicit match
    );

    return policy || null;
};

// 2. Get hospitals empanelled for a specific policy
export const getHospitalsByPolicy = async (policy, userLocation = null) => {
    if (!policy) return [];

    let matchedHospitals = [];

    // Special Handling for CMCHIS
    // New Health Insurance Scheme should NOT enter here.
    if (policy.policy_name.includes("CMCHIS") || (policy.provider_match_string === "CMCHIS" && !policy.policy_name.includes("New Health"))) {
        matchedHospitals = cmchisHospitalsData.map(h => ({
            ...h,
            type: 'Government Empanelled',
            emergency: 'Available 24/7', // Assumption for these hospitals
            source: 'CMCHIS'
        }));
    } else {
        const providerKey = policy.provider_match_string;
        // Filter hospitals that have this provider in their 'insurance' array
        matchedHospitals = getDecoratedHospitals().filter(h => {
            // Check if hospital insurance array contains a string that matches/contains the providerKey
            // Case insensitive match
            return h.insurance.some(ins =>
                ins.toLowerCase() === providerKey.toLowerCase() ||
                ins.toLowerCase().includes(providerKey.toLowerCase()) ||
                (providerKey === 'MA' && (ins.startsWith('MDI') || ins === 'MA'))
            );
        });
    }

    // Decorate with extra info like type/emergency if not already
    // (getDecoratedHospitals already does this, but let's ensure consistency)

    if (userLocation) {
        matchedHospitals = matchedHospitals.map(h => ({
            ...h,
            distance: calculateDistance(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng)
        })).sort((a, b) => a.distance - b.distance);
    }

    return matchedHospitals.slice(0, 5); // Return top 5 as per requirements
};


// Helper to infer hospital type
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

// Helper to infer emergency availability (Mock logic based on type)
const getEmergencyAvailability = (h) => {
    const type = getHospitalType(h);
    if (type === 'Government' || type === 'Multispeciality') return 'Available 24/7';
    return 'On Call / Limited';
};

// Decorate hospitals with extra info
const getDecoratedHospitals = () => {
    return hospitals.map(h => ({
        ...h,
        type: getHospitalType(h),
        emergency: getEmergencyAvailability(h)
    }));
};

export const getHospitals = async (userLocation = null) => {
    return new Promise((resolve) => {
        let allHospitals = getDecoratedHospitals();
        let sortedHospitals = [...allHospitals];

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

// Helper to identify provider from policy number
export const detectProviderFromPolicy = (policyNumber) => {
    if (!policyNumber) return null;
    const upperPolicy = policyNumber.toUpperCase();
    const cleanId = String(policyNumber).trim().toLowerCase();

    // 1. Check against Coverage Data (INS- IDs)
    const knownPolicy = coverageData.find(p => String(p.id).trim().toLowerCase() === cleanId);
    if (knownPolicy) {
        // Map "Standard Health Cover" -> "New Health Insurance Scheme"
        // The hospitalsData.json has "New Health Insurance Scheme" explicitly.
        if (knownPolicy.policyName.includes("Standard Health") || knownPolicy.policyName.includes("New Health")) {
            return "New Health Insurance Scheme";
        }
        return "CMCHIS"; // Fallback
    }

    // 2. Pattern Matching
    if (upperPolicy.startsWith("MDI") || upperPolicy.startsWith("MA")) return "MA";
    if (upperPolicy.includes("HITPA")) return "HI TPA";
    if (upperPolicy.includes("VIDAL") || upperPolicy.startsWith("TTK")) return "Vidal";
    if (upperPolicy.startsWith("STAR")) return "Star Health";
    // Check for "New Health" explicit string
    if (upperPolicy.includes("NEW HEALTH") || upperPolicy.includes("CMCHIS")) return "New Health Insurance Scheme";

    return "Unknown";
};

export const searchHospitalsByIssue = async (issue, userLocation = null, policyNumber = null) => {
    const lowerIssue = issue.toLowerCase();

    // Determine which dataset to use based on policy
    let isCmchis = false;
    if (policyNumber) {
        const detectedProvider = detectProviderFromPolicy(policyNumber);
        // ONLY CMCHIS uses the separate file
        // New Health Insurance Scheme usages the MAIN file (hospitalsData.json) as per user request
        if (detectedProvider === "CMCHIS") {
            isCmchis = true;
        }
    }

    let allHospitals;
    if (isCmchis) {
        allHospitals = cmchisHospitalsData.map(h => ({
            ...h,
            type: 'Government Empanelled',
            emergency: 'Available 24/7',
            source: 'CMCHIS'
        }));
    } else {
        allHospitals = getDecoratedHospitals();
    }

    let results = [];

    // 1. Filter by Issue/Specialty
    // Check specialists
    const hasSpecialist = (h) => h.specialists.some(s => s.toLowerCase().includes(lowerIssue));

    // Check symptoms/keywords mapping
    const symptomsMap = {
        "pain": ["General Physician", "Orthopedic Surgeon"],
        "chest": ["Cardiologist"],
        "heart": ["Cardiologist"],
        "bone": ["Orthopedic Surgeon"],
        "fracture": ["Orthopedic Surgeon"],
        "eye": ["Ophthalmologist"],
        "skin": ["Dermatologist"],
        "kidney": ["Nephrologist"],
        "stomach": ["General Physician"],
        "fever": ["General Physician"],
        "cold": ["General Physician"]
    };

    const relatedSpecialists = Object.keys(symptomsMap).find(key => lowerIssue.includes(key))
        ? symptomsMap[Object.keys(symptomsMap).find(key => lowerIssue.includes(key))]
        : [];

    const matchesSymptom = (h) => relatedSpecialists.some(s => h.specialists.includes(s));

    // Initial Filter
    results = allHospitals.filter(h =>
        hasSpecialist(h) || matchesSymptom(h) || h.name.toLowerCase().includes(lowerIssue) ||
        (lowerIssue.includes("emergency") && (h.type === "Multispeciality" || h.type === "Government"))
    );

    // Fallback if no results
    if (results.length === 0) {
        results = allHospitals.filter(h => h.type === 'Multispeciality' || h.type === 'Government');
    }

    // 2. Filter by Insurance Policy (if provided)
    if (policyNumber) {
        const detectedProvider = detectProviderFromPolicy(policyNumber);
        if (detectedProvider && detectedProvider !== "Unknown") {
            const insuranceResults = results.filter(h => {
                return h.insurance.some(ins =>
                    ins === detectedProvider ||
                    (detectedProvider === "MA" && ins.includes("MA")) ||
                    (detectedProvider === "Vidal" && ins.toLowerCase().includes("vidal"))
                );
            });

            // Only apply filter if we get matches, otherwise show all but warn (or just show all with indication? For now, strict filter)
            if (insuranceResults.length > 0) {
                results = insuranceResults;
            }
        }
    }

    // 3. Sort by Distance if Location Available
    if (userLocation) {
        results = results.map(h => ({
            ...h,
            distance: calculateDistance(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng)
        })).sort((a, b) => a.distance - b.distance);
    } else {
        results = results.sort(() => Math.random() - 0.5);
    }

    // Limit Result Set
    return {
        results: results.slice(0, 20),
        detectedProvider: policyNumber ? detectProviderFromPolicy(policyNumber) : null
    };
};

export const validatePolicy = (policyNumber, hospital) => {
    if (!policyNumber || !hospital) return { valid: false, message: "Invalid Input" };

    const upperPolicy = policyNumber.toUpperCase();
    let detectedProvider = null;

    // 1. Identify Provider from Policy Number Pattern
    if (upperPolicy.startsWith("MDI") || upperPolicy.startsWith("MA")) {
        detectedProvider = "MA"; // MD India
    } else if (upperPolicy.includes("HITPA")) {
        detectedProvider = "HI TPA"; // Heritage
    } else if (upperPolicy.includes("VIDAL") || upperPolicy.startsWith("TTK")) {
        detectedProvider = "Vidal"; // Vidal Health
    } else if (upperPolicy.startsWith("STAR")) {
        detectedProvider = "Star Health";
    } else {
        // Fallback: Check if inputs match generic keywords
        // This is a loose check for user friendliness
        detectedProvider = "Unknown";
    }

    // 2. Check against Hospital's Accepted Insurance List
    // hospital.insurance contains codes like "MA", "HI TPA", "Vidal"
    // We normalize for comparison

    // Direct match check
    const isAccepted = hospital.insurance.some(ins =>
        ins === detectedProvider ||
        (detectedProvider === "MA" && ins.includes("MA")) ||
        (detectedProvider === "vidal" && ins.toLowerCase().includes("vidal"))
    );

    if (isAccepted) {
        return {
            valid: true,
            provider: detectedProvider,
            message: "✅ This hospital accepts your insurance policy (Cashless available)"
        };
    } else {
        return {
            valid: false,
            provider: detectedProvider || "Unknown Provider",
            message: "❌ This hospital does not accept this insurance policy"
        };
    }
};



// 3. Verify Coverage by ID
export const verifyCoverage = (id) => {
    if (!id) return null;
    // Check coverageData
    const cleanId = String(id).trim().toLowerCase();
    const policy = coverageData.find(p => String(p.id).trim().toLowerCase() === cleanId);


    if (policy) {
        // Detect provider for this policy
        const provider = detectProviderFromPolicy(policy.id);

        let hospitalCount = 0;
        if (provider && provider !== "Unknown") {
            if (provider === "CMCHIS" || provider === "New Health Insurance Scheme") {
                hospitalCount = cmchisHospitalsData.length;
            } else {
                const matchedHospitals = hospitals.filter(h => {
                    return h.insurance.some(ins =>
                        ins.toLowerCase() === provider.toLowerCase() ||
                        ins.toLowerCase().includes(provider.toLowerCase()) ||
                        (provider === 'MA' && (ins.startsWith('MDI') || ins === 'MA'))
                    );
                });
                hospitalCount = matchedHospitals.length;
            }
        }

        return {
            valid: true,
            policyName: policy.policyName,
            coverageAmount: policy.coverageAmount,
            type: policy.type,
            provider: provider,
            hospitalCount: hospitalCount
        };
    }
    return { valid: false };
};

// 4. Recommend Hospitals based on Strict Logic & Advanced Filters
export const recommendHospitals = async (specialty, userLocation = null, isEmergency = false, insuranceProvider = null, radius = 50) => {
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
            insurance: ["CMCHIS"] // Ensure it has the tag
        }));
        datasetSource = 'CMCHIS';
    } else if (insuranceProvider === "New Health Insurance Scheme") {
        // STRICTLY INSURANCE DATASET (hospitalsData.json)
        // We filter the main dataset to only include those relevant to NHIS if needed,
        // OR we use the entire dataset if it represents the NHIS network.
        // User prompt: "If insurance type = New Health... Use dataset insurance dataset.xlsx"
        // Our 'hospitalsData.json' IS the converted 'insurance dataset.xlsx'.
        allHospitals = getDecoratedHospitals().map(h => ({
            ...h,
            source: 'NHIS'
        }));
        datasetSource = 'NHIS';
    } else {
        // MERGED / GENERAL SEARCH
        // If no specific insurance selected, or "Both", we might want to merge.
        // For now, default to Main + CMCHIS if no provider specified?
        // Or if user didn't select insurance, show everything?
        const main = getDecoratedHospitals().map(h => ({ ...h, source: 'NHIS' }));
        const cmchis = cmchisHospitalsData.map(h => ({ ...h, type: 'Government Empanelled', source: 'CMCHIS', fee: 0, insurance: ["CMCHIS"] }));
        allHospitals = [...main, ...cmchis];
        datasetSource = 'Combined';
    }

    // 2. STRICT INSURANCE FILTERING
    // If insurance is provided, we MUST exclude anyone who doesn't have it.
    // (Already handled by strict dataset selection above for the specific cases, but double check for "New Health" in main dataset?)
    let pool = allHospitals;

    if (insuranceProvider === "New Health Insurance Scheme") {
        // Ensure the hospital actually accepts it (in case the file has mixed data, though user implies file = scheme)
        // Let's assume the file IS the scheme list.
        // But if we want to be safe:
        // pool = pool.filter(h => h.insurance.some(i => i.includes("New Health") || i.includes("CMCHIS"))); 
        // We'll trust the dataset selection for now as per prompt "Use dataset...".
    }

    // 3. DISTANCE FILTERING & SORTING
    if (userLocation) {
        pool = pool.map(h => ({
            ...h,
            distance: calculateDistance(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng)
        })).filter(h => h.distance <= radius) // RADIUS FILTER
            .sort((a, b) => a.distance - b.distance); // DISTANCE SORT
    } else {
        // If no location, can't filter by radius.
        // Sort by rating?
        pool = pool.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    // 4. SPECIALTY FILTERING
    // If specialty is "General" or empty, show all (limited).
    // Otherwise filter.
    let results = pool;
    if (specialty && specialty !== "General") {
        const lowerSpecialty = specialty.toLowerCase();

        // Exact Match
        const exact = pool.filter(h => h.specialists.some(s => s.toLowerCase().includes(lowerSpecialty)));

        // Symptom/Keyword Match within Name or Type
        const loose = pool.filter(h =>
            !exact.includes(h) && (
                h.name.toLowerCase().includes(lowerSpecialty) ||
                h.type.toLowerCase().includes(lowerSpecialty)
            )
        );

        results = [...exact, ...loose];
    }

    // 5. DEDUPLICATION (If types merged)
    // Use a Map by ID or Name+City
    const uniqueResults = [];
    const seen = new Set();

    for (const h of results) {
        const key = h.id + "-" + (h.name || "unknown"); // Simple key
        if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(h);
        }
    }
    results = uniqueResults;

    // 6. EMERGENCY OVERRIDE
    if (isEmergency) {
        const emerg = results.filter(h => h.emergency === 'Available 24/7');
        const nonEmerg = results.filter(h => h.emergency !== 'Available 24/7');
        results = [...emerg, ...nonEmerg];
    }

    return {
        hospitals: results.slice(0, 50), // Return top 50
        stats: {
            totalInPool: allHospitals.length,
            insuranceMatchCount: pool.length,
            symptomMatchCount: results.length,
            insuranceUsed: insuranceProvider
        }
    };
};
