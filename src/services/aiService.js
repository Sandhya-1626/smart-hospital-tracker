/**
 * Simulates LLM processing for medical data validation and summarization
 */
export const aiService = {
    summarizeReviews: async (reviews) => {
        // Simulating LLM summarization
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`Patients generally appreciate the efficiency here. Top sentiment: "Highly Professional".`);
            }, 1000);
        });
    },

    analyzeSymptom: async (text) => {
        // Simulating LLM interpreting natural language symptoms
        // Returns: { primarySpecialty, allSymptoms, isEmergency, severity }

        const lowerText = text.toLowerCase();

        // 1. Define Symptom-Specialty Map with Severity Weights (1-10)
        const symptomMap = [
            { keywords: ["heart", "chest pain", "palitation", "breathing"], specialty: "Cardiologist", severity: 10 },
            { keywords: ["headache", "migraine", "dizzy", "faint", "seizure", "stroke", "numbness"], specialty: "Neurologist", severity: 9 },
            { keywords: ["bone", "fracture", "joint", "knee", "spine", "back pain", "ortho"], specialty: "Orthopedic Surgeon", severity: 7 },
            { keywords: ["eye", "vision", "blur", "blind"], specialty: "Ophthalmologist", severity: 6 },
            { keywords: ["skin", "rash", "itch", "acne", "hair"], specialty: "Dermatologist", severity: 4 },
            { keywords: ["kidney", "urine", "renal", "stone", "water"], specialty: "Nephrologist", severity: 8 },
            { keywords: ["stomach", "vomit", "diarrhea", "digest", "gastric", "ulcer", "belly"], specialty: "Gastroenterologist", severity: 6 },
            { keywords: ["tooth", "dental", "gum", "cavity"], specialty: "Dentist", severity: 5 },
            { keywords: ["cancer", "tumor", "lump", "chemo"], specialty: "Oncologist", severity: 9 },
            { keywords: ["pregnancy", "baby", "birth", "period", "women"], specialty: "Gynecologist", severity: 8 },
            { keywords: ["child", "baby", "pediatric", "kid"], specialty: "Pediatrician", severity: 7 },
            { keywords: ["ear", "nose", "throat", "ent", "sinus"], specialty: "ENT Specialist", severity: 5 },
            { keywords: ["fever", "cold", "cough", "flu", "weakness", "general"], specialty: "General Physician", severity: 3 }
        ];

        let matched = [];

        // 2. Scan text for matches
        symptomMap.forEach(item => {
            if (item.keywords.some(k => lowerText.includes(k))) {
                matched.push(item);
            }
        });

        if (matched.length === 0) return { primarySpecialty: "General Medicine", isEmergency: false };

        // 3. Prioritize by Severity
        matched.sort((a, b) => b.severity - a.severity);

        const primary = matched[0];
        const isEmergency = primary.severity >= 9 || lowerText.includes("emergency") || lowerText.includes("accident") || lowerText.includes("bleeding");

        // 4. Return structured analysis
        return {
            primarySpecialty: primary.specialty,
            secondarySpecialties: matched.slice(1).map(m => m.specialty),
            isEmergency: isEmergency,
            severity: primary.severity
        };
    },

    recommendSpecialist: async (description) => {
        // Legacy support wrapper
        const analysis = await aiService.analyzeSymptom(description);
        return analysis.primarySpecialty;
    }
};
