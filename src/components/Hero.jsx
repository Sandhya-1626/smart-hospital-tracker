import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Search, Sparkles } from 'lucide-react';
import doctorPatientLogo from '../assets/doctor_patient.svg';
import { motion } from 'framer-motion';

const Hero = ({ onSearch, locationName, isDetecting, locationError }) => {
    const { t } = useLanguage();
    const [issue, setIssue] = useState('');
    const [policyNumber, setPolicyNumber] = useState('');

    // Removed internal detection logic as it is now handled in App.jsx

    const handleSubmit = (e) => {
        e.preventDefault();
        if (issue.trim()) {
            onSearch(issue, policyNumber);
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
                            className={`secondary-button ${isDetecting ? 'animate-pulse' : ''}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '8px 16px', fontSize: '0.9rem', cursor: 'default' }}
                        >
                            <MapPin size={18} color={locationError ? 'var(--error)' : 'var(--primary)'} />
                            <span>{locationError || locationName}</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                                <Search size={20} color="var(--text-muted)" />
                                <input
                                    type="text"
                                    placeholder={t.describeIssue}
                                    value={issue}
                                    onChange={(e) => setIssue(e.target.value)}
                                    style={{ width: '100%', border: 'none', background: 'transparent', padding: '12px', outline: 'none', fontSize: '1rem' }}
                                />
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginRight: '8px' }}>INSURANCE:</div>
                                <input
                                    type="text"
                                    placeholder="Optional: Enter Policy No."
                                    value={policyNumber}
                                    onChange={(e) => setPolicyNumber(e.target.value)}
                                    style={{ width: '100%', border: 'none', background: 'transparent', padding: '12px', outline: 'none', fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>
                        <button type="submit" className="primary-button" style={{ borderRadius: 'var(--radius-md)', padding: '12px' }}>
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
                        <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img
                                src={doctorPatientLogo}
                                alt="Doctor and Patient"
                                style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
                            />
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
