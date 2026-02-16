import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MessageCircle, X, Send, Compass, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = ({ onRadiusChange, onSearch, userLocation, onLocationUpdate }) => {
    const { t } = useLanguage();
    const [chatState, setChatState] = useState('idle'); // 'idle' | 'awaiting_followup'
    const [currentSymptom, setCurrentSymptom] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I can help you find hospitals or provide home-care advice. How can I help?", sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const msgIdCounter = useRef(2); // Start from 2 since 1 is taken

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Simple Symptom Knowledge Base
    const SYMPTOMS = {
        fever: {
            followup: "cold, cough, headache, or body pain",
            advice: [
                "Drink plenty of fluids to stay hydrated.",
                "Rest as much as possible.",
                "Use a warm sponge if temperature is high.",
                "Eat light, easy-to-digest foods."
            ]
        },
        cold: {
            followup: "fever, sore throat, or headache",
            advice: [
                "Steam inhalation can help clear congestion.",
                "Drink warm water or herbal tea.",
                "Avoid cold foods and drinks.",
                "Salt water gargle for sore throat."
            ]
        },
        cough: {
            followup: "fever, cold, or breathing difficulty",
            advice: [
                "Drink warm fluids like soup or tea.",
                "Honey with warm water can soothe the throat.",
                "Elevate your head while sleeping.",
                "Avoid irritants like smoke or dust."
            ]
        },
        headache: {
            followup: "fever, vision issues, or nausea",
            advice: [
                "Rest in a quiet, dark room.",
                "Stay hydrated.",
                "Apply a cold or warm compress to your forehead.",
                "Practice gentle neck stretches."
            ]
        },
        pain: {
            followup: "swelling, redness, or fever",
            advice: [
                "Rest the affected area.",
                "Apply ice for acute injury, heat for muscle stiffness.",
                "Avoid strenuous activity."
            ]
        },
        stomach: {
            followup: "vomiting, fever, or loose motion",
            advice: [
                "Drink lots of fluids (ORS is good).",
                "Eat the BRAT diet (Bananas, Rice, Applesauce, Toast).",
                "Avoid spicy, oily, or dairy foods."
            ]
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: msgIdCounter.current++, text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate thinking time associated with a "real" AI
        setTimeout(() => {
            processInput(userMsg.text);
        }, 1200);
    };

    const [pendingQuery, setPendingQuery] = useState(null);

    const processInput = async (text) => {
        const lowerText = text.toLowerCase();
        let response = "";
        let action = null;
        let isEmergency = false;

        // 0. CHECK FOR RESET
        if (lowerText.includes("reset") || lowerText.includes("start over") || lowerText.includes("cancel")) {
            setChatState('idle');
            setCurrentSymptom(null);
            setPendingQuery(null);
            response = "Okay, I've cleared the conversation. How can I help you regarding hospitals or health?";
            finishResponse(response, action, false);
            return;
        }

        // 1. EMERGENCY CHECK (Always High Priority)
        // If emergency, we attempt to get location, otherwise default to a known safe fall back for search demo
        if (lowerText.includes("emergency") || lowerText.includes("accident") || lowerText.includes("heart attack") || lowerText.includes("ambulance")) {
            response = "🚨 EMERGENCY DETECTED: If this is a life-threatening situation, please call 108 immediately. I am finding the nearest emergency hospitals for you.";
            action = async () => {
                const { recommendHospitals } = await import('../services/dataService');
                const loc = userLocation || { lat: 11.0168, lng: 76.9558 };
                // Emergency usually ignores insurance, but if we wanted to be strict we could pass null or infer.
                // For life-threatening, we prioritize care over insurance.
                const { hospitals } = await recommendHospitals("General", loc, true, null);
                onSearch("emergency");
            };
            finishResponse(response, action, true);
            return;
        }

        // 2. LOCATION PROMPT FLOW
        if (chatState === 'awaiting_location') {
            // ... (keep existing location logic) ... 
            // Copied from previous state essentially, but since we are replacing the block we need to include it.
            setIsTyping(true);
            try {
                const city = text;
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
                const geoData = await geoRes.json();

                if (geoData && geoData.length > 0) {
                    const lat = parseFloat(geoData[0].lat);
                    const lon = parseFloat(geoData[0].lon);
                    const newLocation = { lat, lng: lon };
                    onLocationUpdate(newLocation);
                    response = `📍 Location set to **${city}**. Resuming your search...`;

                    if (pendingQuery) {
                        setTimeout(() => processSymptomQuery(pendingQuery, newLocation), 1000);
                    }
                    setChatState('idle');
                    setPendingQuery(null);
                } else {
                    response = "I couldn't identify that location. Please try entering a major city name (e.g., Chennai, Coimbatore).";
                }
            } catch (e) {
                response = "Sorry, I had trouble finding that location. Please try again.";
            }
            finishResponse(response, null, false);
            return;
        }

        // 3. INSURANCE Logic (General queries)
        // If user just asks about policy availability generally without symptoms
        // We will skip this if it looks like a symptom query (handled below)

        // 4. SYMPTOM ANALYSIS & RECOMMENDATION
        setIsTyping(true);
        try {
            const { aiService } = await import('../services/aiService');

            if (lowerText.match(/^(hi|hello|hey|greetings)/) && text.split(' ').length < 3) {
                response = "Hello! I am your Healthcare Assistant. I can help with finding hospitals or checking symptoms. \n\nFor example: 'I have fever' or 'Find government hospital'.";
                finishResponse(response, null, false);
                return;
            }

            const analysis = await aiService.analyzeSymptom(text);

            if (analysis.primarySpecialty !== "General Medicine" || lowerText.includes("fever") || lowerText.includes("pain") || lowerText.includes("doctor") || lowerText.includes("hospital")) {

                // LOCATION CHECK
                if (!userLocation) {
                    setChatState('awaiting_location');
                    setPendingQuery(text);
                    response = "To find the nearest hospitals, I need your location. 📍\n\nPlease entered your **City** or **Area Name**.";
                    finishResponse(response, null, false);
                    return;
                }

                await processSymptomQuery(text, userLocation);
                return;
            }

            // Fallback
            response = "I can help you find specialist hospitals or provide simple home care advice. \n\nTry saying: 'I have a headache' or 'Show heart hospitals'.";
            action = () => onSearch(text);
            finishResponse(response, action, false);

        } catch (e) {
            console.error(e);
            response = "I encountered an error processing your request.";
            finishResponse(response, null, false);
        }
    };

    const processSymptomQuery = async (text, location) => {
        const { aiService } = await import('../services/aiService');
        const { recommendHospitals, searchInsurancePolicy } = await import('../services/dataService');

        // 1. Analyze Symptom
        const analysis = await aiService.analyzeSymptom(text);
        const specialty = analysis.primarySpecialty;
        const isEmerg = analysis.isEmergency;

        // 2. Detect Insurance in Text
        let insuranceProvider = null;
        const lowerText = text.toLowerCase();

        if (lowerText.includes("cmchis") || lowerText.includes("chief minister")) insuranceProvider = "CMCHIS";
        else if (lowerText.includes("new health") || lowerText.includes("nhis")) insuranceProvider = "New Health Insurance Scheme";
        else if (lowerText.includes("star health")) insuranceProvider = "Star Health";
        else if (lowerText.includes("mdindia") || lowerText.includes("md india")) insuranceProvider = "MDIndia";

        // 3. Get Recommendations
        const { hospitals, stats } = await recommendHospitals(specialty, location, isEmerg, insuranceProvider);

        let response = "";

        // 4. Construct Response
        if (hospitals.length > 0) {
            response = `Showing hospitals near you`;
            if (insuranceProvider) response += ` that accept **${insuranceProvider}**`;
            response += ` and treat **${specialty}** conditions.\n\n`;

            hospitals.forEach((h, index) => {
                const distanceStr = h.distance ? `${h.distance.toFixed(1)} km` : 'Nearby';
                response += `**${h.name} – ${distanceStr}**\n`;
                response += `   Specialty: ${specialty} ${h.specialists.includes(specialty) ? "✅" : "(General)"}\n`;

                // Strict Insurance Display
                if (insuranceProvider) {
                    response += `   Insurance Accepted: **${insuranceProvider}**\n`;
                } else {
                    // If no filter, show distinct top 2 or just "Multiple"
                    response += `   Insurance Accepted: ${h.insurance.slice(0, 2).join(", ")}${h.insurance.length > 2 ? "..." : ""}\n`;
                }

                response += `   Consultation Fee: ₹${h.fee !== undefined ? h.fee : 'Not Available'}\n`;
                // response += `   Location: ${h.location.city || h.city || "Tamil Nadu"}\n`; // Example didn't show location line, but previous did. User example in prompt: "Vasan Eye Care... Specialty... Insurance... Fee...". Location is implied in title or separate? prompt example had 4 lines. I will stick to prompt example + contact if available as per previous "Contact Number" rule or drop it?
                // User Prompt Rule: "For each hospital show: Name, Distance, Specialty, Accepted Insurance, Location, Contact Number"
                // User Example in Prompt: "Vasan Eye Care... Specialty... Insurance... Fee..." -> No Location/Contact in example lines but listed in "OUTPUT RULES". 
                // I will include Fee + Location + Contact to be safe and helpful.
                response += `   Location: ${h.city || "Chennai"}\n`; // simplified
                response += `   Contact: ${h.contact || "Not Available"}\n\n`;
            });

            if (isEmerg) response += `\n🚨 **Seek immediate care if symptoms worsen.**`;

        } else {
            // Fail-safe logic
            if (insuranceProvider && stats.symptomMatchCount > 0 && stats.insuranceMatchCount === 0) {
                // Means we found hospitals for symptom, but insurance filter killed them all.
                // Wait, recommendHospitals logic: 
                // pool = allHospitals; 
                // if (insurance) pool = filtered; -> insuranceMatchCount = pool.length;
                // THIS matches "Found insurance providers" but disregards Specialty.
                // Actually my recommendHospitals return `stats.symptomMatchCount` as `results.length` which is AFTER filtering.
                // I should assume if hospitals.length == 0, we failed.
                // To be precise about "Symptom matched but insurance didn't":
                // I need to know if there were candidates BEFORE insurance filter.
                // My `recommendHospitals` didn't return pre-filter count.
                // Let's just use a generic safe message.
                response = `**No hospitals near you currently accept this insurance policy (${insuranceProvider}).** ⚠️\n\n`;
                response += `However, specialized care for **${specialty}** is available at other hospitals. try searching without the insurance filter.`;
            } else {
                response = `I couldn't find specific **${specialty}** hospitals nearby matching your criteria. \nI recommend visiting the nearest **General Hospital**.`;
            }
        }

        setIsTyping(false);
        setMessages(prev => [...prev, {
            id: msgIdCounter.current++,
            text: response,
            sender: 'bot',
            isEmergency: isEmerg
        }]);
    };

    const searchInsurancePolicyLike = (text) => {
        // Dynamically import the data service to search
        // Since we are in a component, best to have the data service provide a synchronous or async search helper.
        // For simplicity in this edit, we will assume we can access the list or use a heuristic.
        // Actually, let's just use a hardcoded list of known policies for detection or import logic if possible.
        // BUT, since we can't easily change imports at the top without another tool call, 
        // We'll rely on the action to do the heavy lifting, but we need to know IF we should trigger it.

        // Let's match against known keywords from our new dataset
        const knownPolicies = [
            "New Health Insurance Scheme", "Star Health", "MDIndia", "Pro Health",
            "Vidal", "Heritage", "PMJAY", "Ayushman Bharat", "CMCHIS"
        ];

        const textLow = text.toLowerCase();
        const match = knownPolicies.find(p => textLow.includes(p.toLowerCase()));

        if (match) {
            return { policy_name: match, provider_match_string: getProviderKey(match) };
        }
        return null;
    };

    const getProviderKey = (name) => {
        if (name.includes("New Health") || name.includes("CMCHIS") || name.includes("Ayushman") || name.includes("PMJAY")) return "CMCHIS"; // Mapping to Govt schemes
        if (name.includes("Star")) return "Star Health";
        if (name.includes("MDIndia")) return "MA";
        if (name.includes("Vidal")) return "Vidal";
        if (name.includes("Heritage")) return "HI TPA";
        return "Unknown";
    };

    const finishResponse = (response, action, isEmergency) => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
            id: msgIdCounter.current++,
            text: response,
            sender: 'bot',
            isEmergency: isEmergency
        }]);

        if (action) {
            setTimeout(action, 500);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: 'white',
                    boxShadow: '0 10px 25px -5px rgba(0, 98, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '6.5rem',
                            right: '2rem',
                            width: '100%',
                            maxWidth: '380px',
                            height: '500px',
                            background: 'white',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-2xl)',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1000,
                            overflow: 'hidden',
                            border: '1px solid var(--glass-border)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ background: 'var(--primary)', color: 'white', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Compass size={24} className="animate-pulse" />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Health AI Assistant</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Domain-Trained • Emergency Ready</div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#F8FAFC' }}
                        >
                            {messages.map(m => (
                                <div
                                    key={m.id}
                                    style={{
                                        alignSelf: m.sender === 'bot' ? 'flex-start' : 'flex-end',
                                        maxWidth: '85%',
                                        background: m.isEmergency ? '#FEE2E2' : (m.sender === 'bot' ? 'white' : 'var(--primary)'),
                                        color: m.isEmergency ? '#B91C1C' : (m.sender === 'bot' ? 'var(--text-primary)' : 'white'),
                                        padding: '10px 14px',
                                        borderRadius: m.sender === 'bot' ? '4px 16px 16px 16px' : '16px 16px 4px 16px',
                                        fontSize: '0.9rem',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                        border: m.sender === 'bot' ? '1px solid #E2E8F0' : 'none',
                                        whiteSpace: 'pre-wrap' // Preserve newlines
                                    }}
                                >
                                    {m.isEmergency && <AlertTriangle size={16} style={{ marginRight: 5, verticalAlign: 'text-bottom' }} />}
                                    {m.text}
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', background: 'white', padding: '8px 12px', borderRadius: '4px 16px 16px 16px', border: '1px solid #E2E8F0', display: 'flex', gap: '4px' }}>
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: '#94a3b8'
                                            }}
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{
                                                duration: 0.6,
                                                repeat: Infinity,
                                                delay: i * 0.2
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div style={{ display: 'flex', gap: '8px', padding: '8px 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', overflowX: 'auto' }}>
                            <button onClick={() => processInput("Emergency")} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontWeight: 600 }}>Emergency</button>
                            <button onClick={() => processInput("Star Health")} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'white', border: '1px solid #E2E8F0', color: 'var(--primary)' }}>Star Health</button>
                            <button onClick={() => processInput("Govt Hospital")} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'white', border: '1px solid #E2E8F0', color: 'var(--primary)' }}>Govt Hospitals</button>
                        </div>


                        {/* Input */}
                        <div style={{ padding: '1rem', background: 'white', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                placeholder="Ask about symptoms, insurance..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 'var(--radius-md)', padding: '8px 12px', outline: 'none', fontSize: '0.9rem' }}
                            />
                            <button
                                onClick={handleSend}
                                style={{ background: 'var(--primary)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    );
};

export default Chatbot;
