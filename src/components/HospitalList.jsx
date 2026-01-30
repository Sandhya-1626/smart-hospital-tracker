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
                <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{hospital.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {hospital.city} • <Star size={14} fill="var(--warning)" color="var(--warning)" /> {hospital.rating}
                        {hospital.distance && (
                            <span style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                                <MapPin size={14} /> {hospital.distance} km away
                            </span>
                        )}
                    </p>
                </div>

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

                {loading ? (
                    <div style={{ height: '40px', background: '#F8FAFC', borderRadius: '4px' }} className="animate-pulse"></div>
                ) : (
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
            <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card" style={{ height: '200px', marginBottom: '1.5rem', padding: '1.5rem' }}>
                        <div style={{ height: '24px', width: '40%', background: '#F1F5F9', borderRadius: '4px', marginBottom: '1rem' }} className="animate-pulse"></div>
                        <div style={{ height: '16px', width: '20%', background: '#F1F5F9', borderRadius: '4px', marginBottom: '2rem' }} className="animate-pulse"></div>
                        <div style={{ height: '40px', width: '100%', background: '#F1F5F9', borderRadius: '8px' }} className="animate-pulse"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', paddingBottom: '4rem' }}>
            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock color="var(--primary)" /> {t.nearbyHospitals}
            </h2>
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
