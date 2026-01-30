import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Search, Activity, Sparkles, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = ({ onSearch, onLocationUpdate }) => {
    const { t } = useLanguage();
    const [locationName, setLocationName] = useState("Detecting Location...");
    const [issue, setIssue] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const detectLocation = async () => {
        setIsDetecting(true);
        setLocationError(null);
        setLocationName("Locating you...");

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        // Reverse Geocoding using OpenStreetMap (Nominatim)
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();

                        // Extract city or district name
                        const city = data.address.city || data.address.state_district || data.address.town || "Tamil Nadu";
                        const area = data.address.suburb || "";
                        const formattedAddress = area ? `${area}, ${city}` : city;

                        setLocationName(formattedAddress);
                        if (onLocationUpdate) {
                            onLocationUpdate({ lat: latitude, lng: longitude });
                        }
                    } catch (error) {
                        console.error("Geocoding failed:", error);
                        setLocationName("Location Detected (Address unavailable)");
                        if (onLocationUpdate) {
                            onLocationUpdate({ lat: latitude, lng: longitude });
                        }
                    } finally {
                        setIsDetecting(false);
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsDetecting(false);
                    setLocationError("Could not access location.");
                    setLocationName("Tamil Nadu (Default)");
                }
            );
        } else {
            setLocationError("Browser not supported.");
            setIsDetecting(false);
        }
    };

    // Auto-detect on mount
    useEffect(() => {
        detectLocation();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (issue.trim()) {
            onSearch(issue);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '4rem', alignItems: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 98, 255, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                        <Sparkles size={16} />
                        {t.tagline}
                    </div>

                    <h1 style={{ fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {t.heroTitle}
                    </h1>

                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '500px' }}>
                        {t.heroSubtitle}
                    </p>

                    <div style={{ marginBottom: '2rem' }}>
                        <button
                            onClick={detectLocation}
                            className={`secondary-button ${isDetecting ? 'animate-pulse' : ''}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '8px 16px', fontSize: '0.9rem' }}
                        >
                            <MapPin size={18} color={locationError ? 'var(--error)' : 'var(--primary)'} />
                            <span>{locationError || locationName}</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.5rem', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                            <Search size={20} color="var(--text-muted)" />
                            <input
                                type="text"
                                placeholder={t.describeIssue}
                                value={issue}
                                onChange={(e) => setIssue(e.target.value)}
                                style={{ width: '100%', border: 'none', background: 'transparent', padding: '12px', outline: 'none', fontSize: '1rem' }}
                            />
                        </div>
                        <button type="submit" className="primary-button" style={{ borderRadius: 'var(--radius-md)' }}>
                            {t.findHospitals}
                        </button>
                    </form>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
                >
                    <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', width: '100%', aspectRatio: '1/1', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', opacity: 0.1, position: 'absolute', top: 0, left: 0, filter: 'blur(40px)' }}></div>
                    <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}>
                        {/* Abstract Healthcare Illustration */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ width: '40px', height: '10px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                                    <div style={{ width: '20px', height: '10px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                                </div>
                                <Activity color="var(--primary)" />
                            </div>
                            <div style={{ spaceY: '1rem' }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', background: '#F1F5F9', borderRadius: '12px' }}></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ width: '60%', height: '12px', background: '#F1F5F9', borderRadius: '6px', marginBottom: '8px' }}></div>
                                            <div style={{ width: '40%', height: '8px', background: '#F8FAFC', borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @media (max-width: 968px) {
          div[style*="grid-template-columns: minmax(300px, 1fr) 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    );
};

export default Hero;
