import fs from 'fs';

const csvPath = 'c:/Users/sandh/OneDrive/Desktop/smart hospital tracker/tpa-hospitals-2026-01-30.csv';
const data = fs.readFileSync(csvPath, 'utf8');

const lines = data.split('\n');
// Headers are on the first line
const headers = lines[0].split(',');

const hospitals = [];

// Skip header, process a subset (first 200 for performance/relevance)
for (let i = 1; i < Math.min(lines.length, 201); i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Basic CSV split ignoring commas inside quotes
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (!matches) continue;

    const id = matches[0];
    const hospital_name = matches[4]?.replace(/"/g, '') || "Unknown Hospital";
    const district = matches[5] || "Tamil Nadu";
    // const subentities = matches[6] || "General Medicine";
    const pvt_govt = matches[8] || "Private";

    // Generate realistic mock data for fields not in CSV
    const specialists = [];
    if (hospital_name.toLowerCase().includes("multi") || hospital_name.toLowerCase().includes("general")) {
        specialists.push("General Physician", "Cardiologist", "Orthopedic");
    } else if (hospital_name.toLowerCase().includes("eye")) {
        specialists.push("Ophthalmologist");
    } else if (hospital_name.toLowerCase().includes("imaging") || hospital_name.toLowerCase().includes("scan")) {
        specialists.push("Radiologist");
    } else if (hospital_name.toLowerCase().includes("ortho")) {
        specialists.push("Orthopedic Surgeon");
    } else if (hospital_name.toLowerCase().includes("cancer") || hospital_name.toLowerCase().includes("onco")) {
        specialists.push("Oncologist");
    } else if (hospital_name.toLowerCase().includes("dental")) {
        specialists.push("Dentist");
    } else if (hospital_name.toLowerCase().includes("kidney") || hospital_name.toLowerCase().includes("dialysis")) {
        specialists.push("Nephrologist");
    } else if (hospital_name.toLowerCase().includes("maternity") || hospital_name.toLowerCase().includes("women")) {
        specialists.push("Gynecologist");
    } else {
        specialists.push("General Medicine");
    }

    const insurance = ["Star Health", "PNB MetLife"];
    if (pvt_govt.toLowerCase().includes("govt")) insurance.push("CMCHIS (Govt Scheme)");

    hospitals.push({
        id: i, // Use index as ID to be safe
        external_id: id,
        name: hospital_name,
        city: district,
        specialists: specialists,
        insurance: insurance,
        fee: pvt_govt.toLowerCase().includes("govt") ? 0 : (Math.floor(Math.random() * 500) + 300),
        availability: Math.random() > 0.5 ? "Immediate" : "10-20 mins wait",
        rating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
        reviews: "Processed via AI: Highly recommended for " + specialists[0],
        location: { lat: 13.0 + (Math.random() * 2), lng: 80.0 + (Math.random() * 2) } // Random TN coords 
    });
}

const outputPath = 'c:/Users/sandh/OneDrive/Desktop/smart hospital tracker/src/services/hospitalsData.json';
fs.writeFileSync(outputPath, JSON.stringify(hospitals, null, 2));
console.log(`Converted ${hospitals.length} hospitals.`);
