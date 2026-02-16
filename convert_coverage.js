import XLSX from 'xlsx';
import fs from 'fs';

const excelPath = './Smart_Hospital_Insurance_Dataset.xlsx';
const outputPath = './src/services/coverageData.json';

function processCoverage() {
    try {
        if (!fs.existsSync(excelPath)) {
            console.error("❌ 'Smart_Hospital_Insurance_Dataset.xlsx' not found.");
            return;
        }

        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        console.log(`Reading ${rawData.length} coverage records...`);

        const policies = rawData.map((row, index) => {
            // Flexible mapping
            const id = row['Insurance ID'] || row['Policy ID'] || row['ID'] || `INS-${index + 1}`;
            const name = row['Policy Name'] || row['Insurance Name'] || row['Scheme'] || "Standard Health Cover";
            const amount = row['Coverage Amount'] || row['Limit'] || row['Sum Insured'] || row['Coverage'] || "500000";
            const type = row['Type'] || row['Category'] || "Individual";

            return {
                id: String(id).trim(),     // Normalize ID to string
                policyName: name,
                coverageAmount: amount,
                type: type
            };
        });

        fs.writeFileSync(outputPath, JSON.stringify(policies, null, 2));
        console.log(`✅ Converted ${policies.length} policies to ${outputPath}`);

    } catch (e) {
        console.error("❌ Conversion failed:", e);
    }
}

processCoverage();
