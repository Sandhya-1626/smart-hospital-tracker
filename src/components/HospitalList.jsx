import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { aiService } from '../services/aiService';
import { Star, Clock, Heart, ArrowRight, ShieldCheck, CreditCard, MapPin, Ambulance, Building2, Map as MapIcon, List, Navigation, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InsuranceModal from './InsuranceModal';
import MapView from './MapView';

const HospitalCard = ({ hospital, onConsult, activeInsuranceFilter }) => {
    const { t } = useLanguage();
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(true);

    const displayedInsurance = activeInsuranceFilter
        ? hospital.insurance.filter(ins =>
            ins.toLowerCase() === activeInsuranceFilter.toLowerCase() ||
            (activeInsuranceFilter === 'MA' && ins.includes('MA')) ||
            (activeInsuranceFilter.toLowerCase().includes('vidal') && ins.toLowerCase().includes('vidal'))
        )
        : hospital.insurance;

    const finalInsuranceList = displayedInsurance.length > 0 ? displayedInsurance : (activeInsuranceFilter ? [activeInsuranceFilter] : []);

    useEffect(() => {
        const fetchAiData = async () => {
            const summary = await aiService.summarizeReviews(hospital.reviews);
            setAiData({ summary });
            setLoading(false);
        };
        fetchAiData();
    }, [hospital]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, zIndex: 10, boxShadow: 'var(--shadow-lg)' }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="glass-card"
            style={{
                padding: '1.5rem',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                borderRadius: 'var(--radius-xl)'
            }}
        >

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit', fontWeight: 700, letterSpacing: '0.5px' }}>{hospital.name}</h3>
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: hospital.type === 'Government' ? 'var(--primary-light)' : 'rgba(20, 184, 166, 0.1)',
                            color: hospital.type === 'Government' ? 'var(--primary)' : 'var(--secondary)',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                        }}>
                            {hospital.type}
                        </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontWeight: 500 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} color="var(--text-muted)" /> {hospital.city}
                        </span>
                        <span style={{ color: 'var(--border-strong)' }}>|</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 600 }}>
                            <Star size={14} fill="currentColor" /> {hospital.rating}
                        </span>
                        {hospital.distance && (
                            <>
                                <span style={{ color: 'var(--border-strong)' }}>|</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: hospital.distance < 10 ? 'var(--success)' : 'var(--text-secondary)', fontWeight: 600 }}>
                                    <MapPin size={14} /> {hospital.distance} km
                                </span>
                            </>
                        )}
                    </p>
                </div>
                {hospital.distance && hospital.distance < 10 && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Closest
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', zIndex: 1 }}>
                {hospital.specialists.map(s => (
                    <span key={s} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-light)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{s}</span>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', zIndex: 1, marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--error)', fontSize: '0.9rem', fontWeight: 600, background: '#FEF2F2', padding: '10px 14px', borderRadius: '8px' }}>
                    <Ambulance size={18} color="var(--error)" />
                    <span>Emergency: {hospital.emergency}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500, background: 'var(--bg-base)', padding: '10px 14px', borderRadius: '8px' }}>
                    <CreditCard size={18} color="var(--text-muted)" />
                    <span>{t.consultationFee}: <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>₹{hospital.fee}</strong></span>
                </div>
            </div>

            {loading ? (
                <div style={{ height: '70px', background: 'var(--border-light)', borderRadius: '8px' }} className="animate-pulse"></div>
            ) : (
                <div style={{ background: 'var(--bg-accent)', border: '1px solid var(--primary-light)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)', zIndex: 1 }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <Sparkles size={14} /> AI Analysis
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6', fontStyle: 'italic' }}>"{aiData.summary}"</p>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', zIndex: 1 }}>
                <button onClick={onConsult} className="primary-button" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '160px', padding: '14px', fontSize: '0.95rem' }}>
                    {t.consultNow} <ArrowRight size={18} />
                </button>

                <button onClick={() => onConsult(hospital, 'insurance')} className="secondary-button" style={{
                    flex: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    minWidth: '160px', padding: '14px', fontSize: '0.95rem'
                }}>
                    <ShieldCheck size={18} /> Coverage
                </button>

                <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${hospital.location.lat},${hospital.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-button"
                    style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        textDecoration: 'none', minWidth: '130px', padding: '14px', fontSize: '0.95rem'
                    }}
                >
                    <Navigation size={18} /> Map
                </a>
            </div>
        </motion.div>
    );
};

const HospitalList = ({ hospitals, loading, onConsult, userLocation, onLocationUpdate, activeInsuranceFilter, onFilterApply }) => {
    const { t } = useLanguage();
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [radius, setRadius] = useState(50);
    const [manualLocationInput, setManualLocationInput] = useState("");
    const [insuranceFilter, setInsuranceFilter] = useState(activeInsuranceFilter || "");

    useEffect(() => {
        if (activeInsuranceFilter) setInsuranceFilter(activeInsuranceFilter);
    }, [activeInsuranceFilter]);

    const handleManualLocation = async () => {
        if (!manualLocationInput) return null;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocationInput)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const newLoc = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), zoom: 12 };
                onLocationUpdate(newLoc);
                return newLoc;
            } else {
                alert("Location not found");
                return null;
            }
        } catch (e) {
            console.error(e);
            alert("Error finding location");
            return null;
        }
    };

    const handleAction = (hospital, type) => {
        if (type === 'insurance') {
            setSelectedHospital(hospital);
            setIsInsuranceModalOpen(true);
        } else {
            onConsult(hospital);
        }
    };

    if (loading) {
        return (
            <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card" style={{ height: '220px', marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--bg-surface)' }}>
                        <div style={{ height: '28px', width: '40%', background: 'var(--border-light)', borderRadius: '4px', marginBottom: '1rem' }} className="animate-pulse"></div>
                        <div style={{ height: '16px', width: '60%', background: 'var(--border-light)', borderRadius: '4px', marginBottom: '2rem' }} className="animate-pulse"></div>
                        <div style={{ height: '50px', width: '100%', background: 'var(--border-light)', borderRadius: '8px' }} className="animate-pulse"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '2rem auto', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--primary)' }}>|</span> {t.nearbyHospitals}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--bg-base)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px', border: '1px solid var(--border-strong)' }}>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                                borderRadius: '6px', border: 'none', cursor: 'pointer',
                                background: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
                                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontWeight: 600, transition: 'all 0.2s',
                                boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none'
                            }}
                        >
                            <List size={16} /> List
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                                borderRadius: '6px', border: 'none', cursor: 'pointer',
                                background: viewMode === 'map' ? 'var(--bg-surface)' : 'transparent',
                                color: viewMode === 'map' ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontWeight: 600, transition: 'all 0.2s',
                                boxShadow: viewMode === 'map' ? 'var(--shadow-sm)' : 'none'
                            }}
                        >
                            <MapIcon size={16} /> Map
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Controls (Clean Light Style) */}
            <div className="glass-card" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                padding: '1.5rem',
                marginBottom: '2.5rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-strong)'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Insurance Provider</label>
                        <select
                            value={insuranceFilter}
                            onChange={(e) => setInsuranceFilter(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <option value="">All Supported Schemes</option>
                            <option value="CMCHIS">CMCHIS (Govt Target)</option>
                            <option value="New Health Insurance Scheme">New Health Insurance Scheme</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Search Radius ({radius} km)</label>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            value={radius}
                            onChange={(e) => setRadius(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)', marginTop: '8px' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        placeholder="Set Manual City/Area (Optional)"
                        value={manualLocationInput}
                        onChange={(e) => setManualLocationInput(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button
                        onClick={() => {
                            if (manualLocationInput && !userLocation) {
                                handleManualLocation().then(loc => {
                                    onFilterApply({ insurance: insuranceFilter, radius, manualLocation: loc });
                                });
                            } else {
                                onFilterApply({ insurance: insuranceFilter, radius });
                            }
                        }}
                        className="primary-button"
                        style={{ padding: '0 24px', borderRadius: '8px' }}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {hospitals.length > 0 && hospitals[0].source === 'CMCHIS' && (
                <div style={{
                    background: 'var(--bg-accent)',
                    border: '1px solid var(--primary-light)',
                    color: 'var(--primary)',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '2rem'
                }}>
                    <ShieldCheck size={20} />
                    Displaying hospitals verified under Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)
                </div>
            )}

            {viewMode === 'map' ? (
                <div className="glass-card" style={{ padding: '1rem', height: '600px', background: 'var(--bg-surface)' }}>
                    <MapView hospitals={hospitals} userLocation={userLocation} onLocationUpdate={onLocationUpdate} />
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
                    {hospitals.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            No hospitals found matching your criteria.
                        </div>
                    ) : (
                        hospitals.map(h => (
                            <HospitalCard
                                key={h.id}
                                hospital={h}
                                onConsult={handleAction}
                                activeInsuranceFilter={activeInsuranceFilter}
                            />
                        ))
                    )}
                </div>
            )}

            {hospitals.length > 0 && viewMode === 'list' && (
                <div style={{
                    marginTop: '3rem',
                    padding: '1.5rem',
                    background: 'var(--bg-base)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    border: '1px solid var(--border-light)'
                }}>
                    <strong>Disclaimer:</strong> This result is for hospital discovery only and not a medical diagnosis. Please call 108 for emergencies.
                </div>
            )}

            <InsuranceModal
                isOpen={isInsuranceModalOpen}
                onClose={() => setIsInsuranceModalOpen(false)}
                hospital={selectedHospital}
            />
        </div>
    );
};

export default HospitalList;
