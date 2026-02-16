import XLSX from 'xlsx';
import fs from 'fs';

const excelPath = './CMCHIS_Cleaned.xlsx';
const outputPath = './src/services/cmchisHospitals.json';

// District Coordinate Mapping (Approximate Centers)
const districtCoords = {
    "Chennai": { lat: 13.0827, lng: 80.2707 },
    "Coimbatore": { lat: 11.0168, lng: 76.9558 },
    "Madurai": { lat: 9.9252, lng: 78.1198 },
    "Tiruchirappalli": { lat: 10.7905, lng: 78.7047 },
    "Salem": { lat: 11.6643, lng: 78.1460 },
    "Tirunelveli": { lat: 8.7139, lng: 77.7567 },
    "Tiruppur": { lat: 11.1085, lng: 77.3411 },
    "Vellore": { lat: 12.9165, lng: 79.1325 },
    "Erode": { lat: 11.3410, lng: 77.7172 },
    "Thoothukudi": { lat: 8.7642, lng: 78.1348 },
    "Dindigul": { lat: 10.3673, lng: 77.9803 },
    "Thanjavur": { lat: 10.7870, lng: 79.1378 },
    "Ranipet": { lat: 12.9296, lng: 79.3324 },
    "Virudhunagar": { lat: 9.5872, lng: 77.9514 },
    "Karur": { lat: 10.9601, lng: 78.0766 },
    "Nilgiris": { lat: 11.4064, lng: 76.6932 },
    "Krishnagiri": { lat: 12.5186, lng: 78.2138 },
    "Kanyakumari": { lat: 8.0883, lng: 77.5385 },
    "Kancheepuram": { lat: 12.8342, lng: 79.7031 },
    "Namakkal": { lat: 11.2189, lng: 78.1672 },
    "Thiruvallur": { lat: 13.1435, lng: 79.9129 },
    "Theni": { lat: 10.0104, lng: 77.4768 },
    "Ramanathapuram": { lat: 9.3639, lng: 78.8395 },
    "Sivaganga": { lat: 9.8433, lng: 78.4809 },
    "Thiruvarur": { lat: 10.7661, lng: 79.6344 },
    "Pudukkottai": { lat: 10.3797, lng: 78.8202 },
    "Tenkasi": { lat: 8.9594, lng: 77.3129 },
    "Chengalpattu": { lat: 12.6939, lng: 79.9757 },
    "Ariyalur": { lat: 11.1398, lng: 79.0734 },
    "Cuddalore": { lat: 11.7480, lng: 79.7714 },
    "Dharmapuri": { lat: 12.1270, lng: 78.1589 },
    "Kallakurichi": { lat: 11.7384, lng: 78.9639 },
    "Mayiladuthurai": { lat: 11.1075, lng: 79.6524 },
    "Nagapattinam": { lat: 10.7672, lng: 79.8449 },
    "Perambalur": { lat: 11.2342, lng: 78.8756 },
    "Tirupathur": { lat: 12.4925, lng: 78.5639 },
    "Tiruvannamalai": { lat: 12.2253, lng: 79.0747 },
    "Villupuram": { lat: 11.9401, lng: 79.4861 },
};

function processExcel() {
    try {
        console.log("Reading CMCHIS Excel file...");
        if (!fs.existsSync(excelPath)) {
            console.error(`Error: '${excelPath}' not found.`);
            return;
        }

        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);
        console.log(`Found ${rawData.length} rows.`);

        const hospitals = rawData.map((row, index) => {
            const name = row['Hospital Name'] || "Unknown Hospital";
            const district = row['District'] || row['City'] || "Tamil Nadu";
            const contact = row['Contact'] || "Not Available";
            const email = row['Email'] || "Not Available";
            const specialtiesStr = row['Specialties'] || "General Medicine";

            // Normalize Specialties
            const specialists = specialtiesStr.split(",").map(s => s.trim()).filter(s => s);

            // Geo-coordinates
            // Use District mapping + Jitter to avoid stacking
            const baseCoord = districtCoords[district] || { lat: 11.0, lng: 78.0 }; // Default to center of TN if not found
            const lat = baseCoord.lat + (Math.random() - 0.5) * 0.08; // +/- ~4km jitter
            const lng = baseCoord.lng + (Math.random() - 0.5) * 0.08;

            return {
                id: `cmchis-${index + 1}`,
                name: name,
                city: district,
                district: district,
                address: `${row['City'] || district}, ${row['State'] || 'Tamil Nadu'}`,
                contact: contact,
                email: email,
                specialists: specialists,
                insurance: ["CMCHIS", "Chief Minister's Comprehensive Health Insurance Scheme"],
                fee: 0, // Approx for Govt scheme
                rating: 4.0 + Math.random(), // Mock rating
                reviews: "Empanelled under CMCHIS",
                location: { lat, lng }
            };
        });

        fs.writeFileSync(outputPath, JSON.stringify(hospitals, null, 2));
        console.log(`✅ Successfully generated ${outputPath} with ${hospitals.length} hospitals.`);

    } catch (e) {
        console.error("❌ Conversion Failed:", e);
    }
}

processExcel();
