import { verifyCoverage, detectProviderFromPolicy, getHospitalsByPolicy } from './src/services/dataService.js';

// Mock console.log to see output
const log = (msg, val) => console.log(msg, val ? JSON.stringify(val, null, 2) : '');

async function runDebug() {
    console.log("--- DEBUGGING INSURANCE LOGIC ---");

    // 1. Test Coverage Verification
    const testId = "INS-1";
    console.log(`\nTesting verifyCoverage('${testId}')...`);
    const coverage = verifyCoverage(testId);
    log("Coverage Result:", coverage);

    if (!coverage || !coverage.valid) {
        console.error("❌ verifyCoverage FAILED.");
    } else {
        console.log("✅ verifyCoverage PASSED.");
    }

    // 2. Test Provider Detection
    console.log(`\nTesting detectProviderFromPolicy('${testId}')...`);
    const provider = detectProviderFromPolicy(testId);
    log("Detected Provider:", provider);

    // 3. Test Hospital Fetching
    if (provider) {
        console.log(`\nTesting getHospitalsByPolicy for provider '${provider}'...`);
        // Mock a policy object as expected by getHospitalsByPolicy
        const mockPolicy = { provider_match_string: provider };
        const hospitals = await getHospitalsByPolicy(mockPolicy);
        log(`Found ${hospitals.length} hospitals. First match:`, hospitals[0]);

        if (hospitals.length === 0) {
            console.error("❌ No hospitals found for this provider.");
        } else {
            console.log("✅ Hospitals found.");
        }
    }
}

runDebug();
