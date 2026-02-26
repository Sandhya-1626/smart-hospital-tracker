import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Search, MapPin, Activity, Stethoscope, ArrowRight, Mic, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = ({ onSearch, locationName, isDetecting, locationError, userLocation }) => {
    const { t } = useLanguage();
    const [issue, setIssue] = useState('');
    const [policyNumber, setPolicyNumber] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(issue, policyNumber);
    };

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8rem 2rem 4rem 2rem',
            overflow: 'hidden',
            background: 'var(--bg-base)'
        }}>
            {/* Calm Medical Gradient Background */}
            <motion.div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #F8FAFC 0%, #E6F2FF 50%, #F8FAFC 100%)',
                zIndex: -4,
                animation: 'gradientSlide 20s infinite alternate ease-in-out'
            }} />

            {/* Subtle Abstract Highlights */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '10%',
                width: '40vw',
                height: '40vw',
                background: 'radial-gradient(circle, rgba(42, 125, 225, 0.05) 0%, rgba(255,255,255,0) 70%)',
                filter: 'blur(60px)',
                zIndex: -3,
                borderRadius: '50%'
            }} />

            {/* Floating Soft Icons for subtle medical feel */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -2, overflow: 'hidden' }}>
                <HeartPulse size={120} color="var(--primary)" className="animate-float" style={{ position: 'absolute', top: '15%', left: '-5%', opacity: 0.03, animationDuration: '12s' }} />
                <Activity size={80} color="var(--secondary)" className="animate-float-delayed" style={{ position: 'absolute', bottom: '20%', right: '5%', opacity: 0.04, animationDuration: '15s' }} />
            </div>

            <motion.div
                style={{
                    maxWidth: '1000px',
                    width: '100%',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}
            >
                {/* Reassurance Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-strong)',
                        boxShadow: 'var(--shadow-sm)',
                        padding: '6px 16px',
                        borderRadius: 'var(--radius-full)',
                        marginBottom: '2rem',
                        color: 'var(--primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        letterSpacing: '0.5px'
                    }}
                >
                    <ShieldCheck size={16} />
                    <span>Trusted by 10,000+ patients in Tamil Nadu</span>
                </motion.div>

                {/* Calm, Bold Typography */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        fontSize: 'clamp(3rem, 7vw, 5rem)',
                        fontWeight: 800,
                        fontFamily: 'Outfit',
                        lineHeight: 1.1,
                        letterSpacing: '-1px',
                        marginBottom: '1.25rem',
                        color: 'var(--text-primary)'
                    }}
                >
                    Instant Care.<br />
                    <span style={{ color: 'var(--primary)' }}>Zero Wait.</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    style={{
                        fontSize: '1.15rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '650px',
                        marginBottom: '3rem',
                        lineHeight: 1.6,
                        fontWeight: 400
                    }}
                >
                    Connect with top-tier hospitals and specialized doctors in real-time. Navigate your healthcare journey with confidence and clarity.
                </motion.p>

                {/* Clean White Search Container */}
                <motion.form
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, type: 'spring', damping: 25, stiffness: 120 }}
                    onSubmit={handleSearch}
                    style={{
                        width: '100%',
                        maxWidth: '850px',
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-xl)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-light)',
                        boxShadow: isFocused ? '0 0 0 4px var(--primary-light), var(--shadow-lg)' : 'var(--shadow-md)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px 8px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                        <MapPin size={16} color="var(--primary)" />
                        {isDetecting ? t.detectLocation : locationError ? locationError : `Searching near: ${locationName}`}
                        {userLocation && <span style={{ color: 'var(--success)' }}>• Location Active</span>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }} className="hero-search-container">
                        {/* Primary Input */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'var(--bg-base)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '0.25rem 1.5rem',
                            flex: 2,
                            border: '1px solid var(--border-strong)',
                            transition: 'border-color 0.3s'
                        }}>
                            <Search size={20} color="var(--text-muted)" />

                            <input
                                type="text"
                                placeholder="Specialty, Doctor, or Symptoms (e.g., Cardiology)"
                                value={issue}
                                onChange={(e) => setIssue(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    fontSize: '1.05rem',
                                    boxShadow: 'none',
                                    outline: 'none'
                                }}
                            />

                            <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', color: 'var(--text-muted)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'} title="Voice Search">
                                <Mic size={20} />
                            </button>
                        </div>

                        {/* Secondary Inputs Container */}
                        <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }} className="hero-search-details">
                            <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <Stethoscope size={18} color="var(--text-muted)" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Insurance / Policy #"
                                    value={policyNumber}
                                    onChange={(e) => setPolicyNumber(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    style={{
                                        width: '100%', padding: '1.15rem 1rem 1.15rem 44px',
                                        background: 'var(--bg-base)', border: '1px solid var(--border-strong)',
                                        borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)',
                                        fontSize: '1rem', outline: 'none', boxShadow: 'none'
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                className="primary-button"
                                style={{
                                    padding: '0 2.5rem',
                                    fontSize: '1.05rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    flex: '1',
                                    minWidth: '160px',
                                    borderRadius: 'var(--radius-lg)'
                                }}
                            >
                                Find Care <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </motion.form>

                {/* Popular Searches */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}
                >
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginRight: '8px', alignSelf: 'center' }}>Popular:</span>
                    {['General Physician', 'Pediatrics', 'Orthopedics', 'Dentist'].map((tag, i) => (
                        <button key={i} style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-strong)',
                            color: 'var(--text-secondary)',
                            padding: '6px 16px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                            onClick={() => { setIssue(tag); setIsFocused(true); }}
                        >
                            {tag}
                        </button>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Hero;
