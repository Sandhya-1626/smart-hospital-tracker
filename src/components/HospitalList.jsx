import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { aiService } from '../services/aiService';
import { Star, Clock, Heart, ArrowRight, ShieldCheck, CreditCard, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const HospitalCard = ({ hospital, onConsult }) => {
    const { t } = useLanguage();
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(true);

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
            className="glass-card"
            style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{hospital.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        {hospital.city} • <Star size={14} fill="var(--warning)" color="var(--warning)" /> {hospital.rating}
                        {hospital.distance && (
                            <span style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: hospital.distance < 10 ? 'var(--success)' : 'var(--primary)', fontWeight: 700 }}>
                                <MapPin size={14} /> {hospital.distance} km away
                            </span>
                        )}
                    </p>
                </div>
                {hospital.distance && hospital.distance < 10 && (
                    <div style={{ background: 'var(--success)', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Closest Facility
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {hospital.specialists.map(s => (
                    <span key={s} style={{ background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-primary)' }}>{s}</span>
                ))}
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <ShieldCheck size={16} color="var(--primary)" />
                    <span>{t.insuranceAccepted}: {hospital.insurance.join(", ")}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <CreditCard size={16} color="var(--primary)" />
                    <span>{t.consultationFee}: ₹{hospital.fee}</span>
                </div>

                {loading ? null : (
                    <div style={{ background: 'rgba(0, 98, 255, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Heart size={14} /> {t.aiInsight}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{aiData.summary}"</p>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button onClick={onConsult} className="primary-button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {t.consultNow} <ArrowRight size={16} />
                </button>
                <button onClick={onConsult} className="secondary-button" style={{ flex: 1 }}>
                    {t.bookAppointment}
                </button>
            </div>
        </motion.div>
    );
};

const HospitalList = ({ hospitals, loading, onConsult }) => {
    const { t } = useLanguage();

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Searching for the best care...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
                    <Clock color="var(--primary)" /> {t.nearbyHospitals}
                </h2>
                {hospitals[0]?.distance && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {hospitals.some(h => h.distance) && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', background: '#ECFDF5', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
                                <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></div>
                                Sorting by Proximity
                            </div>
                        )}
                    </div>
                )}
            </div>
            {hospitals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    No hospitals found for your search. Try describing your symptoms differently.
                </div>
            ) : (
                hospitals.map(h => (
                    <HospitalCard key={h.id} hospital={h} onConsult={onConsult} />
                ))
            )}
        </div>
    );
};

export default HospitalList;
